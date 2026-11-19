import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { User } from '../models/User.js';
import { Order, OrderStatus } from '../models/Order.js';
import { Coupon } from '../models/Coupon.js';
import { CouponRedemption } from '../models/CouponRedemption.js';
import { emitOrderUpdate } from '../config/socket.js';
import { sendMail } from '../config/mailer.js';
import { getOrderStatusEmailHtml } from '../utils/helpers.js';

// ==========================================
// ADMIN PRODUCT MANAGEMENT
// ==========================================

export const getAdminProducts = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, category, page = '1', limit = '10', sort = 'newest' } = req.query;

    const query: any = {};
    if (search && typeof search === 'string' && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }
    if (category && typeof category === 'string' && category !== 'all') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    let sortOptions: any = { createdAt: -1 };
    if (sort === 'price_asc') sortOptions = { price: 1 };
    else if (sort === 'price_desc') sortOptions = { price: -1 };
    else if (sort === 'stock') sortOptions = { stockQuantity: 1 };

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(query).sort(sortOptions).skip(skip).limit(limitNum),
      Product.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createAdminProduct = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const body = req.body;
    const slug = body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);

    const product = await Product.create({
      ...body,
      slug,
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminProductById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const updateAdminProduct = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const body = req.body;

    const product = await Product.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const patchProductAvailability = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { availability } = req.body;

    const product = await Product.findByIdAndUpdate(
      id,
      { availability: Boolean(availability) },
      { new: true }
    );

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Product availability updated to ${product.availability ? 'Available' : 'Unavailable'}.`,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAdminProduct = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN CATEGORY MANAGEMENT
// ==========================================

export const createCategory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, description, image, displayOrder, isActive } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const category = await Category.create({
      name,
      slug,
      description,
      image,
      displayOrder: displayOrder || 0,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!category) {
      res.status(404).json({ success: false, message: 'Category not found.' });
      return;
    }
    res.status(200).json({ success: true, message: 'Category updated successfully.', data: category });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      res.status(404).json({ success: false, message: 'Category not found.' });
      return;
    }
    res.status(200).json({ success: true, message: 'Category deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN USER MANAGEMENT
// ==========================================

export const getAdminUsers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, role, status, page = '1', limit = '10' } = req.query;

    const query: any = {};
    if (search && typeof search === 'string' && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
        { phone: { $regex: search.trim(), $options: 'i' } },
        { location: { $regex: search.trim(), $options: 'i' } },
      ];
    }
    if (role && role !== 'all') query.role = role;
    if (status && status !== 'all') query.accountStatus = status;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      User.countDocuments(query),
    ]);

    // Attach order summary for each user
    const usersWithStats = await Promise.all(
      users.map(async (u) => {
        const orderCount = await Order.countDocuments({ userId: u._id });
        return {
          id: u._id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          location: u.location,
          pinCode: u.pinCode,
          marketingConsent: u.marketingConsent,
          role: u.role,
          accountStatus: u.accountStatus,
          createdAt: u.createdAt,
          orderCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: usersWithStats,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminUserById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const orders = await Order.find({ userId: user._id }).sort({ createdAt: -1 });
    const totalSpent = orders.reduce((sum, o) => sum + (o.orderStatus !== 'CANCELLED' ? o.totalAmount : 0), 0);

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        pinCode: user.pinCode,
        marketingConsent: user.marketingConsent,
        role: user.role,
        accountStatus: user.accountStatus,
        createdAt: user.createdAt,
        totalSpent,
        orderCount: orders.length,
        orders,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN ORDER MANAGEMENT & TRACKING
// ==========================================

export const getAdminOrders = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, status, page = '1', limit = '10' } = req.query;

    const query: any = {};
    if (search && typeof search === 'string' && search.trim() !== '') {
      query.$or = [
        { orderNumber: { $regex: search.trim(), $options: 'i' } },
        { customerName: { $regex: search.trim(), $options: 'i' } },
        { customerEmail: { $regex: search.trim(), $options: 'i' } },
        { 'shippingAddress.phone': { $regex: search.trim(), $options: 'i' } },
      ];
    }
    if (status && status !== 'all') {
      query.orderStatus = status;
    }

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Order.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminOrderById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, message, courierName, trackingNumber, estimatedDeliveryDate } = req.body;
    const adminUser = req.user!;

    const order = await Order.findById(id);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }

    const previousStatus = order.orderStatus;
    order.orderStatus = status as OrderStatus;

    if (courierName !== undefined) order.courierName = courierName;
    if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
    if (estimatedDeliveryDate !== undefined) order.estimatedDeliveryDate = new Date(estimatedDeliveryDate);

    // If order delivered, mark paymentStatus as PAID if COD
    if (status === 'DELIVERED' && order.paymentMethod === 'COD') {
      order.paymentStatus = 'PAID';
    }

    // Append to statusHistory
    const statusNote = message || `Order status updated to ${status}.`;
    order.statusHistory.push({
      status: status as OrderStatus,
      message: statusNote,
      updatedBy: adminUser.name || 'Admin',
      updatedAt: new Date(),
    });

    await order.save();

    // Broadcast real-time update to Socket.IO order room
    const updatePayload = {
      orderId: order._id,
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      message: statusNote,
      courierName: order.courierName,
      trackingNumber: order.trackingNumber,
      estimatedDeliveryDate: order.estimatedDeliveryDate,
      updatedAt: new Date(),
      statusHistory: order.statusHistory,
    };

    emitOrderUpdate(order._id.toString(), updatePayload);

    // Send email notification for critical milestones (CONFIRMED, SHIPPED, OUT FOR DELIVERY, DELIVERED, CANCELLED)
    if (previousStatus !== status) {
      const emailHtml = getOrderStatusEmailHtml({
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        status: order.orderStatus,
        message: statusNote,
        totalAmount: order.totalAmount,
        courierName: order.courierName,
        trackingNumber: order.trackingNumber,
        estimatedDeliveryDate: order.estimatedDeliveryDate,
      });

      sendMail({
        to: order.customerEmail,
        subject: `Order #${order.orderNumber} Status: ${order.orderStatus} - MITAHARA`,
        html: emailHtml,
        text: `Your order #${order.orderNumber} is now ${order.orderStatus}. Note: ${statusNote}`,
      }).catch((e) => console.error('Status notification email error:', e));
    }

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}.`,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN COUPON MANAGEMENT
// ==========================================

export const getAdminCoupons = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });

    // Attach performance details
    const couponsWithPerformance = await Promise.all(
      coupons.map(async (c) => {
        const redemptions = await CouponRedemption.find({ couponId: c._id });
        const totalDiscountGiven = redemptions.reduce((sum, r) => sum + r.discountAmount, 0);

        return {
          ...c.toObject(),
          totalDiscountGiven,
          redemptionCount: redemptions.length,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: couponsWithPerformance,
    });
  } catch (error) {
    next(error);
  }
};

export const createAdminCoupon = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const body = req.body;
    const existing = await Coupon.findOne({ couponCode: body.couponCode.toUpperCase().trim() });
    if (existing) {
      res.status(409).json({ success: false, message: 'A coupon with this code already exists.' });
      return;
    }

    const coupon = await Coupon.create({
      ...body,
      couponCode: body.couponCode.toUpperCase().trim(),
    });

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully.',
      data: coupon,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminCouponById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      res.status(404).json({ success: false, message: 'Coupon not found.' });
      return;
    }
    res.status(200).json({ success: true, data: coupon });
  } catch (error) {
    next(error);
  }
};

export const updateAdminCoupon = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!coupon) {
      res.status(404).json({ success: false, message: 'Coupon not found.' });
      return;
    }
    res.status(200).json({ success: true, message: 'Coupon updated successfully.', data: coupon });
  } catch (error) {
    next(error);
  }
};

export const patchCouponStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const coupon = await Coupon.findByIdAndUpdate(id, { isActive: Boolean(isActive) }, { new: true });
    if (!coupon) {
      res.status(404).json({ success: false, message: 'Coupon not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Coupon status updated to ${coupon.isActive ? 'Active' : 'Inactive'}.`,
      data: coupon,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAdminCoupon = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) {
      res.status(404).json({ success: false, message: 'Coupon not found.' });
      return;
    }
    res.status(200).json({ success: true, message: 'Coupon deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
