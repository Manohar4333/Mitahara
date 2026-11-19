import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.js';
import { Otp } from '../models/Otp.js';
import { ENV } from '../config/env.js';
import { sendMail } from '../config/mailer.js';
import { generateOtp, hashOtp, verifyOtpHash, getOtpEmailHtml } from '../utils/helpers.js';
import { signAccessToken, signRefreshToken, setAuthCookies, clearAuthCookies, TokenPayload } from '../utils/jwt.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export const sendOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    // Check resend cooldown
    const existingOtp = await Otp.findOne({ email: normalizedEmail, isUsed: false });
    if (existingOtp) {
      const now = new Date();
      const elapsedSeconds = Math.floor((now.getTime() - existingOtp.lastSentAt.getTime()) / 1000);
      const cooldown = ENV.OTP_RESEND_COOLDOWN_SEC;

      if (elapsedSeconds < cooldown) {
        res.status(429).json({
          success: false,
          message: `Please wait ${cooldown - elapsedSeconds} seconds before requesting a new OTP.`,
          cooldownRemaining: cooldown - elapsedSeconds,
        });
        return;
      }
    }

    // Generate new OTP
    const plainOtp = generateOtp();
    const hashed = hashOtp(plainOtp);
    const expiresAt = new Date(Date.now() + ENV.OTP_EXPIRY_MIN * 60 * 1000);

    // Save or update OTP document
    await Otp.findOneAndUpdate(
      { email: normalizedEmail },
      {
        hashedOtp: hashed,
        attempts: 0,
        maxAttempts: ENV.OTP_MAX_ATTEMPTS,
        isUsed: false,
        expiresAt,
        lastSentAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // Send email using Nodemailer
    const emailSubject = `Your MITAHARA Verification Code: ${plainOtp}`;
    const emailHtml = getOtpEmailHtml(plainOtp, ENV.OTP_EXPIRY_MIN);

    await sendMail({
      to: normalizedEmail,
      subject: emailSubject,
      html: emailHtml,
      text: `Your MITAHARA verification code is ${plainOtp}. It is valid for ${ENV.OTP_EXPIRY_MIN} minutes.`,
    });

    // Provide seamless OTP logging in console for testing/development
    console.log(`[AUTH] OTP generated for ${normalizedEmail}: ${plainOtp}`);

    res.status(200).json({
      success: true,
      message: `A 6-digit verification code has been sent to ${normalizedEmail}.`,
      expiresInMinutes: ENV.OTP_EXPIRY_MIN,
      cooldownSeconds: ENV.OTP_RESEND_COOLDOWN_SEC,
      // Include devOtp in development when SMTP credentials are not yet entered by user
      ...(ENV.NODE_ENV === 'development' || !ENV.SMTP_PASS ? { devOtp: plainOtp } : {}),
    });
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const otpRecord = await Otp.findOne({ email: normalizedEmail, isUsed: false });

    if (!otpRecord) {
      res.status(400).json({
        success: false,
        message: 'No active OTP request found. Please request a new code.',
      });
      return;
    }

    // Check expiration
    if (new Date() > otpRecord.expiresAt) {
      await Otp.deleteOne({ _id: otpRecord._id });
      res.status(400).json({
        success: false,
        message: 'This OTP has expired. Please request a new one.',
      });
      return;
    }

    // Check attempts limit
    if (otpRecord.attempts >= otpRecord.maxAttempts) {
      await Otp.deleteOne({ _id: otpRecord._id });
      res.status(403).json({
        success: false,
        message: 'Maximum verification attempts exceeded. Please request a new OTP.',
      });
      return;
    }

    // Verify OTP hash
    const isValid = verifyOtpHash(otp, otpRecord.hashedOtp);
    if (!isValid) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      const remaining = otpRecord.maxAttempts - otpRecord.attempts;
      res.status(400).json({
        success: false,
        message: `Incorrect OTP. You have ${remaining} attempt(s) remaining.`,
      });
      return;
    }

    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    // Check if user exists or create new user
    let user = await User.findOne({ email: normalizedEmail });
    const isAdminEmail = normalizedEmail === ENV.ADMIN_EMAIL.toLowerCase();

    if (!user) {
      user = await User.create({
        email: normalizedEmail,
        name: isAdminEmail ? ENV.ADMIN_NAME : normalizedEmail.split('@')[0],
        role: isAdminEmail ? 'admin' : 'user',
        accountStatus: 'active',
        marketingConsent: false,
      });
      console.log(`[AUTH] Created new user: ${normalizedEmail} (Role: ${user.role})`);
    } else if (isAdminEmail && user.role !== 'admin') {
      user.role = 'admin';
      await user.save();
    }

    if (user.accountStatus === 'suspended') {
      res.status(403).json({
        success: false,
        message: 'Your account is suspended. Please contact customer support.',
      });
      return;
    }

    // Generate JWT tokens
    const tokenPayload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    // Set secure HTTP-only cookies
    setAuthCookies(res, accessToken, refreshToken);

    res.status(200).json({
      success: true,
      message: 'Authentication successful.',
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        pinCode: user.pinCode,
        role: user.role,
        marketingConsent: user.marketingConsent,
        savedAddresses: user.savedAddresses,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user!;
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        pinCode: user.pinCode,
        role: user.role,
        marketingConsent: user.marketingConsent,
        savedAddresses: user.savedAddresses,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  clearAuthCookies(res);
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};
