import { Router } from 'express';
import {
  getAdminProducts,
  createAdminProduct,
  getAdminProductById,
  updateAdminProduct,
  patchProductAvailability,
  deleteAdminProduct,
  createCategory,
  updateCategory,
  deleteCategory,
  getAdminUsers,
  getAdminUserById,
  getAdminOrders,
  getAdminOrderById,
  updateOrderStatus,
  getAdminCoupons,
  createAdminCoupon,
  getAdminCouponById,
  updateAdminCoupon,
  patchCouponStatus,
  deleteAdminCoupon,
} from '../controllers/adminController.js';
import {
  getAnalyticsOverview,
  getRevenueAnalytics,
  getOrderAnalytics,
  getProductAnalytics,
  getCustomerAnalytics,
  getCouponAnalytics,
  getCampaignAnalytics,
  exportOrdersCsv,
  exportCustomersCsv,
} from '../controllers/analyticsController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validateMiddleware.js';
import { createProductSchema, updateProductSchema, productAvailabilitySchema } from '../validators/productValidators.js';
import { createCouponSchema, updateCouponSchema } from '../validators/couponValidators.js';
import { updateOrderStatusSchema } from '../validators/orderValidators.js';

const router = Router();

// Protect ALL admin routes with requireAdmin
router.use(requireAdmin);

// Products
router.get('/products', getAdminProducts);
router.post('/products', validateBody(createProductSchema), createAdminProduct);
router.get('/products/:id', getAdminProductById);
router.put('/products/:id', validateBody(updateProductSchema), updateAdminProduct);
router.patch('/products/:id/availability', validateBody(productAvailabilitySchema), patchProductAvailability);
router.delete('/products/:id', deleteAdminProduct);

// Categories
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Users
router.get('/users', getAdminUsers);
router.get('/users/:id', getAdminUserById);

// Orders & Tracking
router.get('/orders', getAdminOrders);
router.get('/orders/:id', getAdminOrderById);
router.patch('/orders/:id/status', validateBody(updateOrderStatusSchema), updateOrderStatus);

// Coupons
router.get('/coupons', getAdminCoupons);
router.post('/coupons', validateBody(createCouponSchema), createAdminCoupon);
router.get('/coupons/:id', getAdminCouponById);
router.put('/coupons/:id', validateBody(updateCouponSchema), updateAdminCoupon);
router.patch('/coupons/:id/status', patchCouponStatus);
router.delete('/coupons/:id', deleteAdminCoupon);

// Marketing Analytics
router.get('/analytics/overview', getAnalyticsOverview);
router.get('/analytics/revenue', getRevenueAnalytics);
router.get('/analytics/orders', getOrderAnalytics);
router.get('/analytics/products', getProductAnalytics);
router.get('/analytics/customers', getCustomerAnalytics);
router.get('/analytics/coupons', getCouponAnalytics);
router.get('/analytics/campaigns', getCampaignAnalytics);
router.get('/analytics/export/orders', exportOrdersCsv);
router.get('/analytics/export/customers', exportCustomersCsv);

export default router;
