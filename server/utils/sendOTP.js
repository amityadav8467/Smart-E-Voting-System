import nodemailer from 'nodemailer';

/**
 * Generate a 6-digit OTP
 * @returns {string} OTP string
 */
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP email to user
 * @param {string} email - Recipient email
 * @param {string} otp - OTP to send
 * @param {string} purpose - Purpose of OTP (verification/reset)
 */
export const sendOTPEmail = async (email, otp, purpose = 'verification') => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const subject = purpose === 'reset' ? 'Password Reset OTP' : 'Email Verification OTP';
  const mailOptions = {
    from: `"Smart E-Voting System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9f9f9;">
        <h2 style="color:#1d4ed8;">Smart E-Voting System</h2>
        <p>Your OTP for ${purpose} is:</p>
        <h1 style="color:#1d4ed8;letter-spacing:8px;">${otp}</h1>
        <p>This OTP expires in <strong>10 minutes</strong>.</p>
        <p style="color:#666;">If you did not request this, please ignore this email.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
  console.log(`OTP email sent to ${email}`);
};
