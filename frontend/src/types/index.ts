export interface IUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  pinCode?: string;
  role: 'user' | 'admin';
  marketingConsent: boolean;
  savedAddresses?: IAddress[];
  createdAt?: string;
}

export interface IAddress {
  _id?: string;
  fullName: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  category: string;
  categoryId?: string;
  description: string;
  keyHealthBenefits: string[];
  price: number;
  originalPrice?: number;
  images: string[];
  stockQuantity: number;
  availability: boolean;
  rating: number;
  reviewsCount: number;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  unit: string;
  dietaryBadges: string[];
  viewsCount?: number;
  salesCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  displayOrder: number;
  isActive: boolean;
  productCount?: number;
}

export interface ICartItem {
  productId: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  unit: string;
  category: string;
  quantity: number;
  stockQuantity: number;
  total: number;
}

export interface ICartSummary {
  items: ICartItem[];
  itemCount: number;
  subtotal: number;
  deliveryCharge: number;
  gst: number;
  total: number;
}

export type OrderStatus =
  | 'ORDER PLACED'
  | 'ORDER CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'OUT FOR DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface IStatusHistory {
  status: OrderStatus;
  message: string;
  updatedBy: string;
  updatedAt: string;
}

export interface IOrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  unit?: string;
  category?: string;
}

export interface IOrder {
  _id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: IOrderItem[];
  shippingAddress: IAddress;
  subtotal: number;
  deliveryCharge: number;
  couponCode?: string;
  discountAmount: number;
  gst: number;
  totalAmount: number;
  paymentMethod: 'COD' | 'ONLINE';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  orderStatus: OrderStatus;
  trackingNumber?: string;
  courierName?: string;
  estimatedDeliveryDate?: string;
  statusHistory: IStatusHistory[];
  campaignAttribution?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ITimelineStage {
  stage: OrderStatus;
  state: 'completed' | 'current' | 'pending';
  timestamp: string | null;
  message: string | null;
}

export interface IOrderTrackingData {
  orderNumber: string;
  currentStatus: OrderStatus;
  isCancelled: boolean;
  courierName?: string;
  trackingNumber?: string;
  estimatedDeliveryDate?: string;
  createdAt: string;
  updatedAt: string;
  statusHistory: IStatusHistory[];
  timeline: ITimelineStage[];
  items: IOrderItem[];
  totalAmount: number;
  shippingAddress: IAddress;
}

export interface ICoupon {
  _id: string;
  couponCode: string;
  description: string;
  discountType: 'percentage' | 'fixed' | 'free_delivery';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  startDate: string;
  expiryDate: string;
  totalUsageLimit: number;
  timesUsed: number;
  perUserUsageLimit: number;
  applicableCategories?: string[];
  applicableProducts?: string[];
  isActive: boolean;
  totalDiscountGiven?: number;
  redemptionCount?: number;
  createdAt?: string;
}

export interface IValidatedCouponData {
  couponCode: string;
  description: string;
  discountType: 'percentage' | 'fixed' | 'free_delivery';
  discountValue: number;
  discountAmount: number;
  subtotal: number;
  deliveryCharge: number;
  gst: number;
  finalAmount: number;
}
