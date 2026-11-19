import mongoose, { Document, Schema } from 'mongoose';

export interface ICampaignEvent extends Document {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  eventType: 'visit' | 'cart_add' | 'order_placed';
  userId?: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId;
  revenue?: number;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

const CampaignEventSchema = new Schema<ICampaignEvent>(
  {
    utm_source: { type: String, default: 'direct', index: true },
    utm_medium: { type: String, default: 'none', index: true },
    utm_campaign: { type: String, default: 'organic', index: true },
    eventType: {
      type: String,
      enum: ['visit', 'cart_add', 'order_placed'],
      default: 'visit',
      index: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    revenue: { type: Number, default: 0 },
    ipAddress: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: true,
  }
);

CampaignEventSchema.index({ utm_campaign: 1, utm_source: 1, timestamp: -1 });

export const CampaignEvent = mongoose.model<ICampaignEvent>('CampaignEvent', CampaignEventSchema);
