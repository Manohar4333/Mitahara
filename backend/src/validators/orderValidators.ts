import { z } from 'zod';

export const checkoutSchema = z.object({
  shippingAddress: z.object({
    fullName: z.string().min(2, 'Recipient full name is required').trim(),
    phone: z.string().min(7, 'Contact phone number is required').trim(),
    streetAddress: z.string().min(5, 'Street address is required').trim(),
    city: z.string().min(2, 'City is required').trim(),
    state: z.string().min(2, 'State is required').trim(),
    postalCode: z.string().min(4, 'PIN code is required').trim(),
    country: z.string().default('India'),
  }),
  paymentMethod: z.enum(['COD', 'ONLINE']).default('COD'),
  couponCode: z.string().trim().toUpperCase().optional(),
  campaignAttribution: z
    .object({
      utm_source: z.string().optional(),
      utm_medium: z.string().optional(),
      utm_campaign: z.string().optional(),
    })
    .optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'ORDER PLACED',
    'ORDER CONFIRMED',
    'PROCESSING',
    'SHIPPED',
    'OUT FOR DELIVERY',
    'DELIVERED',
    'CANCELLED',
  ]),
  message: z.string().optional(),
  courierName: z.string().optional(),
  trackingNumber: z.string().optional(),
  estimatedDeliveryDate: z.string().or(z.date()).optional(),
});
