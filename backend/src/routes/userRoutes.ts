import { Router } from 'express';
import {
  getUserProfile,
  updateUserProfile,
  addSavedAddress,
  deleteSavedAddress,
} from '../controllers/userController.js';
import {
  getUserOrders,
  getUserOrderById,
  getUserOrderTracking,
} from '../controllers/orderController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validateMiddleware.js';
import { updateProfileSchema, addressSchema } from '../validators/authValidators.js';

const router = Router();

router.use(requireAuth);

router.get('/profile', getUserProfile);
router.put('/profile', validateBody(updateProfileSchema), updateUserProfile);
router.post('/addresses', validateBody(addressSchema), addSavedAddress);
router.delete('/addresses/:addressId', deleteSavedAddress);

router.get('/orders', getUserOrders);
router.get('/orders/:id', getUserOrderById);
router.get('/orders/:id/tracking', getUserOrderTracking);

export default router;
