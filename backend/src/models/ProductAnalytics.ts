import mongoose, { Document, Schema } from 'mongoose';

export interface IProductAnalytics extends Document {
  productId: mongoose.Types.ObjectId;
  views: number;
  cartAdds: number;
  purchases: number;
  revenue: number;
  lastViewedAt: Date;
}

const ProductAnalyticsSchema = new Schema<IProductAnalytics>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      unique: true,
      index: true,
    },
    views: { type: Number, default: 0 },
    cartAdds: { type: Number, default: 0 },
    purchases: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    lastViewedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export const ProductAnalytics = mongoose.model<IProductAnalytics>(
  'ProductAnalytics',
  ProductAnalyticsSchema
);
