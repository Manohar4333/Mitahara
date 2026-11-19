import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(2, 'Product name is required').trim(),
  category: z.string().min(2, 'Category is required').trim(),
  description: z.string().min(5, 'Product description is required').trim(),
  keyHealthBenefits: z.array(z.string()).default([]),
  price: z.number().min(0, 'Price must be positive'),
  originalPrice: z.number().min(0).optional(),
  images: z.array(z.string()).min(1, 'At least one image URL is required'),
  stockQuantity: z.number().int().min(0, 'Stock cannot be negative').default(10),
  availability: z.boolean().default(true),
  unit: z.string().default('Pack of 1'),
  dietaryBadges: z.array(z.string()).default([]),
  isFeatured: z.boolean().optional().default(false),
  isBestSeller: z.boolean().optional().default(false),
  isNewArrival: z.boolean().optional().default(false),
});

export const updateProductSchema = createProductSchema.partial();

export const productAvailabilitySchema = z.object({
  availability: z.boolean(),
});
