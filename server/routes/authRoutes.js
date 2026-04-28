import express from 'express';
import { register, verifyOTP, login, logout, forgotPassword, resetPassword, refreshToken } from '../controllers/authController.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'Too many login attempts, please try again after 15 minutes' }
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { message: 'Too many registration attempts, please try again later' }
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many OTP requests, please try again after 15 minutes' }
});

router.post('/register', registerLimiter, register);
router.post('/verify-otp', otpLimiter, verifyOTP);
router.post('/login', loginLimiter, login);
router.post('/logout', logout);
router.post('/forgot-password', otpLimiter, forgotPassword);
router.post('/reset-password', otpLimiter, resetPassword);
router.post('/refresh-token', loginLimiter, refreshToken);

export default router;
