import express from 'express';
import { register, verifyOTP, login, logout, forgotPassword, resetPassword, refreshToken } from '../controllers/authController.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'Too many login attempts, please try again after 15 minutes' }
});

router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/login', loginLimiter, login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/refresh-token', refreshToken);

export default router;
