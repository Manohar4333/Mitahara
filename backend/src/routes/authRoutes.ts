import { Router } from 'express';
import { sendOtp, verifyOtp, getMe, logout } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { otpLimiter } from '../middleware/rateLimitMiddleware.js';
import { validateBody } from '../middleware/validateMiddleware.js';
import { sendOtpSchema, verifyOtpSchema } from '../validators/authValidators.js';

const router = Router();

router.post('/send-otp', otpLimiter, validateBody(sendOtpSchema), sendOtp);
router.post('/verify-otp', validateBody(verifyOtpSchema), verifyOtp);
router.post('/logout', logout);
router.get('/me', requireAuth, getMe);

export default router;
