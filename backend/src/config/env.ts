import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  MONGO_URI: process.env.MONGO_URI || '',
  JWT_SECRET: process.env.JWT_SECRET || 'mitahara_jwt_secret_dev_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || 'mitahara_refresh_secret_key_2026',
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
  SMTP_USER: process.env.SMTP_USER || 'manoharthappetla@gmail.com',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_FROM: process.env.SMTP_FROM || 'manoharthappetla@gmail.com',
  OTP_RESEND_COOLDOWN_SEC: process.env.OTP_RESEND_COOLDOWN_SEC ? parseInt(process.env.OTP_RESEND_COOLDOWN_SEC, 10) : 60,
  OTP_EXPIRY_MIN: process.env.OTP_EXPIRY_MIN ? parseInt(process.env.OTP_EXPIRY_MIN, 10) : 5,
  OTP_MAX_ATTEMPTS: process.env.OTP_MAX_ATTEMPTS ? parseInt(process.env.OTP_MAX_ATTEMPTS, 10) : 5,
  ADMIN_EMAIL: (process.env.ADMIN_EMAIL || 'admin@mitahara.online').toLowerCase(),
  ADMIN_NAME: process.env.ADMIN_NAME || 'Mitahara Admin',
};
