import mongoose from 'mongoose';
import { Coupon, ICoupon } from '../models/Coupon.js';
import { CouponRedemption } from '../models/CouponRedemption.js';

export interface CouponValidationResult {
  isValid: boolean;
  message?: string;
  coupon?: ICoupon;
  discountAmount: number;
}

export const validateAndCalculateCoupon = async ({
  couponCode,
  userId,
  subtotal,
  deliveryCharge = 24,
  cartItems = [],
}: {
  couponCode: string;
  userId?: string | mongoose.Types.ObjectId;
  subtotal: number;
  deliveryCharge?: number;
  cartItems?: Array<{ productId: any; category?: string; price: number; quantity: number }>;
}): Promise<CouponValidationResult> => {
  const normalizedCode = couponCode.trim().toUpperCase();

  const coupon = await Coupon.findOne({ couponCode: normalizedCode });
  if (!coupon) {
    return { isValid: false, message: 'Invalid coupon code.', discountAmount: 0 };
  }

  if (!coupon.isActive) {
    return { isValid: false, message: 'This coupon is currently inactive.', discountAmount: 0 };
  }

  const now = new Date();
  if (coupon.startDate && now < coupon.startDate) {
    return { isValid: false, message: 'This coupon promotion has not started yet.', discountAmount: 0 };
  }

  if (coupon.expiryDate && now > coupon.expiryDate) {
    return { isValid: false, message: 'This coupon has expired.', discountAmount: 0 };
  }

  if (coupon.timesUsed >= coupon.totalUsageLimit) {
    return { isValid: false, message: 'Coupon usage limit has been reached.', discountAmount: 0 };
  }

  if (subtotal < coupon.minOrderAmount) {
    return {
      isValid: false,
      message: `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon.`,
      discountAmount: 0,
    };
  }

  // Check per-user usage limit if user is identified
  if (userId) {
    const userRedemptionCount = await CouponRedemption.countDocuments({
      couponId: coupon._id,
      userId,
    });

    if (userRedemptionCount >= coupon.perUserUsageLimit) {
      return {
        isValid: false,
        message: `You have already used this coupon the maximum allowed times (${coupon.perUserUsageLimit}).`,
        discountAmount: 0,
      };
    }
  }

  // Calculate discount based on type
  let discount = 0;

  if (coupon.discountType === 'percentage') {
    discount = (subtotal * coupon.discountValue) / 100;
    if (coupon.maxDiscountAmount && coupon.maxDiscountAmount > 0) {
      discount = Math.min(discount, coupon.maxDiscountAmount);
    }
  } else if (coupon.discountType === 'fixed') {
    discount = Math.min(coupon.discountValue, subtotal);
  } else if (coupon.discountType === 'free_delivery') {
    discount = deliveryCharge;
  }

  // Round discount to nearest 2 decimals
  discount = Math.round(discount * 100) / 100;

  return {
    isValid: true,
    coupon,
    discountAmount: discount,
  };
};
