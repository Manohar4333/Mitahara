import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { validateAndCalculateCoupon } from '../services/couponService.js';
import { Cart } from '../models/Cart.js';

export const validateCoupon = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { couponCode, subtotal } = req.body;
    const userId = req.userId;

    let orderSubtotal = typeof subtotal === 'number' ? subtotal : 0;

    // If subtotal is not provided or 0, attempt to look up from user's cart in DB
    if (orderSubtotal <= 0 && userId) {
      const cart = await Cart.findOne({ userId }).populate('items.productId');
      if (cart) {
        orderSubtotal = cart.items.reduce((sum: number, it: any) => {
          return it.productId && it.productId.availability ? sum + it.productId.price * it.quantity : sum;
        }, 0);
      }
    }

    const deliveryCharge = 24; // Fixed ₹24 per order
    const result = await validateAndCalculateCoupon({
      couponCode,
      userId,
      subtotal: orderSubtotal,
      deliveryCharge,
    });

    if (!result.isValid) {
      res.status(400).json({
        success: false,
        message: result.message || 'Coupon is not applicable.',
      });
      return;
    }

    const finalAmount = Math.max(0, orderSubtotal + deliveryCharge - result.discountAmount);

    res.status(200).json({
      success: true,
      message: `Coupon "${result.coupon?.couponCode}" applied successfully!`,
      data: {
        couponCode: result.coupon?.couponCode,
        description: result.coupon?.description,
        discountType: result.coupon?.discountType,
        discountValue: result.coupon?.discountValue,
        discountAmount: result.discountAmount,
        subtotal: orderSubtotal,
        deliveryCharge,
        gst: 0,
        finalAmount,
      },
    });
  } catch (error) {
    next(error);
  }
};
