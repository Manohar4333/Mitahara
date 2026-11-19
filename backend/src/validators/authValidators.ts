import { z } from 'zod';

export const sendOtpSchema = z.object({
  email: z.string().email('Please provide a valid email address').trim().toLowerCase(),
});

export const verifyOtpSchema = z.object({
  email: z.string().email('Please provide a valid email address').trim().toLowerCase(),
  otp: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d{6}$/, 'OTP must contain numbers only'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(60).optional(),
  phone: z.string().max(20).optional(),
  location: z.string().max(100).optional(),
  pinCode: z.string().max(10).optional(),
  marketingConsent: z.boolean().optional(),
});

export const addressSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().min(7, 'Valid contact number is required'),
  streetAddress: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().min(4, 'Valid postal code is required'),
  country: z.string().default('India'),
  isDefault: z.boolean().optional().default(false),
});
