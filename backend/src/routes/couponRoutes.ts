import { Router } from 'express';
import { validateCoupon } from '../controllers/couponController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validateMiddleware.js';
import { validateCouponInputSchema } from '../validators/couponValidators.js';

const router = Router();

router.post('/validate', optionalAuth, validateBody(validateCouponInputSchema), validateCoupon);

export default router;
