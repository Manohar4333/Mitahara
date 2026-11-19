import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';
import { Order, OrderStatus } from '../models/Order.js';
import { Coupon } from '../models/Coupon.js';
import { CouponRedemption } from '../models/CouponRedemption.js';
import { ProductAnalytics } from '../models/ProductAnalytics.js';
import { CampaignEvent } from '../models/CampaignEvent.js';
import { generateOrderNumber, getOrderStatusEmailHtml } from '../utils/helpers.js';
import { validateAndCalculateCoupon } from '../services/couponService.js';
import { sendMail } from '../config/mailer.js';

export const checkout = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user!;
    const userId = user._id;
    const { shippingAddress, paymentMethod = 'COD', couponCode, campaignAttribution } = req.body;

    // 1. Fetch user's cart from DB
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Your cart is empty. Please add items to checkout.',
      });
      return;
    }

    // 2. Validate live product details & calculate subtotal strictly from DB prices
    const orderItems = [];
    let subtotal = 0;

    for (const item of cart.items) {
      const product: any = item.productId;
      if (!product || !product.availability) {
        res.status(400).json({
          success: false,
          message: `Product "${product?.name || 'Item'}" is currently unavailable. Please remove it from your cart.`,
        });
        return;
      }

      if (product.stockQuantity < item.quantity) {
        res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Only ${product.stockQuantity} remaining.`,
        });
        return;
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: product._id,
        name: product.name,
        price: product.price, // Live verified price
        quantity: item.quantity,
        image: product.images?.[0] || '',
        unit: product.unit || '',
        category: product.category || '',
      });
    }

    // 3. Fixed delivery charge & zero GST
    const deliveryCharge = 24; // ₹24 fixed
    const gst = 0; // ₹0 charged

    // 4. Validate coupon if provided
    let discountAmount = 0;
    let couponId: mongoose.Types.ObjectId | undefined;
    let validatedCouponCode: string | undefined;

    if (couponCode && couponCode.trim() !== '') {
      const couponResult = await validateAndCalculateCoupon({
        couponCode,
        userId,
        subtotal,
        deliveryCharge,
      });

      if (!couponResult.isValid) {
        res.status(400).json({
          success: false,
          message: couponResult.message || 'The specified coupon is invalid.',
        });
        return;
      }

      discountAmount = couponResult.discountAmount;
      couponId = couponResult.coupon?._id as mongoose.Types.ObjectId;
      validatedCouponCode = couponResult.coupon?.couponCode;
    }

    // 5. Calculate final total amount
    const totalAmount = Math.max(0, subtotal + deliveryCharge - discountAmount);
    const orderNumber = generateOrderNumber();

    // 6. Create the Order
    const newOrder = await Order.create({
      orderNumber,
      userId,
      customerName: shippingAddress.fullName || user.name,
      customerEmail: user.email,
      customerPhone: shippingAddress.phone || user.phone || '',
      items: orderItems,
      shippingAddress,
      subtotal,
      deliveryCharge,
      couponId,
      couponCode: validatedCouponCode,
      discountAmount,
      gst,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PAID',
      orderStatus: 'ORDER PLACED',
      statusHistory: [
        {
          status: 'ORDER PLACED',
          message: 'Order received and waiting for merchant confirmation.',
          updatedBy: 'customer',
          updatedAt: new Date(),
        },
      ],
      campaignAttribution: {
        utm_source: campaignAttribution?.utm_source || 'direct',
        utm_medium: campaignAttribution?.utm_medium || 'none',
        utm_campaign: campaignAttribution?.utm_campaign || 'organic',
      },
    });

    // 7. Atomic coupon usage increment and redemption recording
    if (couponId && validatedCouponCode) {
      await Coupon.updateOne(
        { _id: couponId },
        { $inc: { timesUsed: 1 } }
      );
      await CouponRedemption.create({
        couponId,
        couponCode: validatedCouponCode,
        userId,
        orderId: newOrder._id,
        discountAmount,
        redeemedAt: new Date(),
      });
    }

    // 8. Decrement stock quantities and update sales counts
    for (const it of orderItems) {
      await Product.updateOne(
        { _id: it.productId },
        {
          $inc: {
            stockQuantity: -it.quantity,
            salesCount: it.quantity,
          },
        }
      );

      await ProductAnalytics.findOneAndUpdate(
        { productId: it.productId },
        {
          $inc: {
            purchases: it.quantity,
            revenue: it.price * it.quantity,
          },
        },
        { upsert: true }
      );
    }

    // 9. Clear the user's cart
    await Cart.updateOne({ userId }, { items: [] });

    // 10. Record CampaignEvent if attribution is present
    if (campaignAttribution?.utm_campaign || campaignAttribution?.utm_source) {
      CampaignEvent.create({
        utm_source: campaignAttribution.utm_source || 'direct',
        utm_medium: campaignAttribution.utm_medium || 'none',
        utm_campaign: campaignAttribution.utm_campaign || 'organic',
        eventType: 'order_placed',
        userId,
        orderId: newOrder._id,
        revenue: totalAmount,
      }).catch((e) => console.error('Campaign tracking error:', e));
    }

    // 11. Dispatch Order Confirmation Email
    const emailHtml = getOrderStatusEmailHtml({
      orderNumber: newOrder.orderNumber,
      customerName: newOrder.customerName,
      status: 'ORDER PLACED',
      message: 'Thank you for your order with MITAHARA! We are preparing your nutritious products.',
      totalAmount: newOrder.totalAmount,
    });

    sendMail({
      to: newOrder.customerEmail,
      subject: `Order Confirmation #${newOrder.orderNumber} - MITAHARA`,
      html: emailHtml,
      text: `Your order #${newOrder.orderNumber} has been placed successfully for total amount ₹${newOrder.totalAmount}.`,
    }).catch((e) => console.error('Order email error:', e));

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      data: newOrder,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserOrders = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId!;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserOrderById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId!;
    const id = String(req.params.id);

    let order;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(id);
    } else {
      order = await Order.findOne({ orderNumber: id });
    }

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }

    // Authorization check: User can only view their own order unless admin
    if (order.userId.toString() !== userId && req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserOrderTracking = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId!;
    const id = String(req.params.id);

    let order;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(id);
    } else {
      order = await Order.findOne({ orderNumber: id });
    }

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }

    if (order.userId.toString() !== userId && req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    // Define all standard chronological stages
    const allStages: OrderStatus[] = [
      'ORDER PLACED',
      'ORDER CONFIRMED',
      'PROCESSING',
      'SHIPPED',
      'OUT FOR DELIVERY',
      'DELIVERED',
    ];

    const currentStatus = order.orderStatus;
    const isCancelled = currentStatus === 'CANCELLED';

    // Map stages to completed / current / pending
    const currentStageIndex = allStages.indexOf(currentStatus);

    const timeline = allStages.map((stage, index) => {
      let state: 'completed' | 'current' | 'pending' = 'pending';
      if (!isCancelled) {
        if (index < currentStageIndex) state = 'completed';
        else if (index === currentStageIndex) state = 'current';
        else state = 'pending';
      }

      // Check if this status exists in history
      const historyEntry = order.statusHistory.find((h) => h.status === stage);

      return {
        stage,
        state,
        timestamp: historyEntry?.updatedAt || null,
        message: historyEntry?.message || null,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        currentStatus: order.orderStatus,
        isCancelled,
        courierName: order.courierName,
        trackingNumber: order.trackingNumber,
        estimatedDeliveryDate: order.estimatedDeliveryDate,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        statusHistory: order.statusHistory,
        timeline,
        items: order.items,
        totalAmount: order.totalAmount,
        shippingAddress: order.shippingAddress,
      },
    });
  } catch (error) {
    next(error);
  }
};
