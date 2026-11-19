import mongoose, { Document, Schema } from 'mongoose';

export type DiscountType = 'percentage' | 'fixed' | 'free_delivery';

export interface ICoupon extends Document {
  couponCode: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  startDate: Date;
  expiryDate: Date;
  totalUsageLimit: number;
  timesUsed: number;
  perUserUsageLimit: number;
  applicableCategories?: string[];
  applicableProducts?: mongoose.Types.ObjectId[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    couponCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed', 'free_delivery'],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxDiscountAmount: {
      type: Number,
      default: null,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    totalUsageLimit: {
      type: Number,
      default: 1000,
      min: 1,
    },
    timesUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    perUserUsageLimit: {
      type: Number,
      default: 1,
      min: 1,
    },
    applicableCategories: {
      type: [String],
      default: [],
    },
    applicableProducts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Coupon = mongoose.model<ICoupon>('Coupon', CouponSchema);
