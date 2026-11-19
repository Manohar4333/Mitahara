
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const isProduction = process.env.NODE_ENV === 'production';

const requiredSecret = (name: string): string => {
  const value = process.env[name];

  if (!value || value.length < 32) {
    throw new Error(
      `${name} must be configured with at least 32 characters`
    );
  }

  return value;
};

export const ENV = {
  PORT: Number(process.env.PORT || 5000),

  NODE_ENV: process.env.NODE_ENV || 'development',

  FRONTEND_URL:
    process.env.FRONTEND_URL || 'http://localhost:3000',

  MONGO_URI: process.env.MONGO_URI || '',

  JWT_SECRET: isProduction
    ? requiredSecret('JWT_SECRET')
    : process.env.JWT_SECRET || 'local_dev_jwt_secret_only',

  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  REFRESH_TOKEN_SECRET: isProduction
    ? requiredSecret('REFRESH_TOKEN_SECRET')
    : process.env.REFRESH_TOKEN_SECRET || 'local_dev_refresh_secret_only',

  REFRESH_TOKEN_EXPIRES_IN:
    process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',

  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',

  SMTP_PORT: Number(process.env.SMTP_PORT || 587),

  SMTP_USER: process.env.SMTP_USER || '',

  SMTP_PASS: process.env.SMTP_PASS || '',

  SMTP_FROM: process.env.SMTP_FROM || '',

  OTP_RESEND_COOLDOWN_SEC:
    Number(process.env.OTP_RESEND_COOLDOWN_SEC || 60),

  OTP_EXPIRY_MIN:
    Number(process.env.OTP_EXPIRY_MIN || 5),

  OTP_MAX_ATTEMPTS:
    Number(process.env.OTP_MAX_ATTEMPTS || 5),

  ADMIN_EMAIL:
    (process.env.ADMIN_EMAIL || 'admin@mitahara.online').toLowerCase(),

  ADMIN_NAME:
    process.env.ADMIN_NAME || 'Mitahara Admin',
};
