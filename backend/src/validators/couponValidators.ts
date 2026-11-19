import { z } from 'zod';

export const createCouponSchema = z.object({
  couponCode: z.string().min(3, 'Coupon code must be at least 3 characters').toUpperCase().trim(),
  description: z.string().min(3, 'Description is required').trim(),
  discountType: z.enum(['percentage', 'fixed', 'free_delivery']),
  discountValue: z.number().min(0, 'Discount value must be at least 0'),
  minOrderAmount: z.number().min(0).default(0),
  maxDiscountAmount: z.number().min(0).nullable().optional(),
  startDate: z.string().or(z.date()).optional(),
  expiryDate: z.string().or(z.date()),
  totalUsageLimit: z.number().int().min(1).default(1000),
  perUserUsageLimit: z.number().int().min(1).default(1),
  applicableCategories: z.array(z.string()).optional().default([]),
  applicableProducts: z.array(z.string()).optional().default([]),
  isActive: z.boolean().default(true),
});

export const updateCouponSchema = createCouponSchema.partial();

export const validateCouponInputSchema = z.object({
  couponCode: z.string().min(1, 'Coupon code is required').toUpperCase().trim(),
  subtotal: z.number().min(0).optional(),
});
