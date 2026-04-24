import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { generateOTP, sendOTPEmail } from '../utils/sendOTP.js';

/**
 * Generate JWT access token
 */
const generateAccessToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '15m' });

/**
 * Generate JWT refresh token
 */
const generateRefreshToken = (id) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

/**
 * @desc Register new voter
 * @route POST /api/auth/register
 */
export const register = async (req, res) => {
  try {
    const { name, email, phone, voterID, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { voterID }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email or Voter ID already exists' });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    const user = await User.create({ name, email, phone, voterID, password, otp, otpExpiry });

    await sendOTPEmail(email, otp, 'verification');

    res.status(201).json({ message: 'Registration successful. Please verify your email with the OTP sent.', userId: user._id });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

/**
 * @desc Verify OTP for email verification
 * @route POST /api/auth/verify-otp
 */
export const verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'User already verified' });
    if (user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully. You can now login.' });
  } catch (error) {
    console.error('Verify OTP error:', error.message);
    res.status(500).json({ message: 'Server error during OTP verification' });
  }
};

/**
 * @desc Login user
 * @route POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(401).json({ message: 'Please verify your email first' });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.json({
      accessToken,
      refreshToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error during login' });
  }
};

/**
 * @desc Forgot password - send OTP
 * @route POST /api/auth/forgot-password
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: 'No user found with this email' });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOTPEmail(email, otp, 'reset');
    res.json({ message: 'Password reset OTP sent to your email', userId: user._id });
  } catch (error) {
    console.error('Forgot password error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc Reset password with OTP
 * @route POST /api/auth/reset-password
 */
export const resetPassword = async (req, res) => {
  try {
    const { userId, otp, newPassword } = req.body;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.password = newPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc Logout user
 * @route POST /api/auth/logout
 */
export const logout = async (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

/**
 * @desc Refresh access token
 * @route POST /api/auth/refresh-token
 */
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return res.status(401).json({ message: 'Refresh token required' });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const accessToken = generateAccessToken(decoded.id);
    res.json({ accessToken });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};
