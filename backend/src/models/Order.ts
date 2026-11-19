import mongoose, { Document, Schema } from 'mongoose';

export type OrderStatus =
  | 'ORDER PLACED'
  | 'ORDER CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'OUT FOR DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  unit?: string;
  category?: string;
}

export interface IStatusHistory {
  status: OrderStatus;
  message: string;
  updatedBy: string; // 'customer' | 'admin' | 'system' | admin name
  updatedAt: Date;
}

export interface ICampaignAttribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  userId: mongoose.Types.ObjectId;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: IOrderItem[];
  shippingAddress: {
    fullName: string;
    phone: string;
    streetAddress: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  subtotal: number;
  deliveryCharge: number; // ₹24 fixed
  couponId?: mongoose.Types.ObjectId;
  couponCode?: string;
  discountAmount: number;
  gst: number; // ₹0 charged
  totalAmount: number;
  paymentMethod: 'COD' | 'ONLINE';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  orderStatus: OrderStatus;
  trackingNumber?: string;
  courierName?: string;
  estimatedDeliveryDate?: Date;
  statusHistory: IStatusHistory[];
  campaignAttribution?: ICampaignAttribution;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String, default: '' },
    unit: { type: String, default: '' },
    category: { type: String, default: '' },
  },
  { _id: false }
);

const StatusHistorySchema = new Schema<IStatusHistory>(
  {
    status: {
      type: String,
      required: true,
      enum: [
        'ORDER PLACED',
        'ORDER CONFIRMED',
        'PROCESSING',
        'SHIPPED',
        'OUT FOR DELIVERY',
        'DELIVERED',
        'CANCELLED',
      ],
    },
    message: { type: String, default: '' },
    updatedBy: { type: String, default: 'system' },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true, lowercase: true, index: true },
    customerPhone: { type: String, required: true },
    items: [OrderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      streetAddress: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, default: 'India' },
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryCharge: {
      type: Number,
      required: true,
      default: 24, // Prompt specifies ₹24 per order
    },
    couponId: {
      type: Schema.Types.ObjectId,
      ref: 'Coupon',
    },
    couponCode: {
      type: String,
      uppercase: true,
      trim: true,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    gst: {
      type: Number,
      default: 0, // ₹0 charged as per prompt
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'ONLINE'],
      default: 'COD',
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED'],
      default: 'PENDING',
    },
    orderStatus: {
      type: String,
      enum: [
        'ORDER PLACED',
        'ORDER CONFIRMED',
        'PROCESSING',
        'SHIPPED',
        'OUT FOR DELIVERY',
        'DELIVERED',
        'CANCELLED',
      ],
      default: 'ORDER PLACED',
      index: true,
    },
    trackingNumber: { type: String, default: '' },
    courierName: { type: String, default: '' },
    estimatedDeliveryDate: { type: Date },
    statusHistory: [StatusHistorySchema],
    campaignAttribution: {
      utm_source: { type: String, default: '' },
      utm_medium: { type: String, default: '' },
      utm_campaign: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
