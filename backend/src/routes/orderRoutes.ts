import { Router } from 'express';
import {
  checkout,
  getUserOrders,
  getUserOrderById,
  getUserOrderTracking,
} from '../controllers/orderController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validateMiddleware.js';
import { checkoutSchema } from '../validators/orderValidators.js';

const router = Router();

router.use(requireAuth);

router.post('/checkout', validateBody(checkoutSchema), checkout);
router.get('/my-orders', getUserOrders);
router.get('/:id', getUserOrderById);
router.get('/:id/tracking', getUserOrderTracking);

export default router;
