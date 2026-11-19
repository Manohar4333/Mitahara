
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import { ENV } from './config/env.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import { apiLimiter } from './middleware/rateLimitMiddleware.js';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

export const createApp = (): Application => {
  const app: Application = express();

  // Security Headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false,
    })
  );

  // CORS Configuration
  const allowedOrigins = [
    ENV.FRONTEND_URL,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://mitahara.online',
  ].filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests without an Origin header (e.g. server-to-server)
        if (!origin) {
          return callback(null, true);
        }

        // Allow only configured frontend origins
        if (
          allowedOrigins.includes(origin) ||
          (ENV.NODE_ENV !== 'production' &&
            origin.endsWith('.localhost:3000'))
        ) {
          return callback(null, true);
        }

        return callback(new Error('Origin not allowed by CORS'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Cookie',
      ],
    })
  );

  // Body Parsing & Cookies
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // Request Logging
  if (ENV.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // Rate Limiting
  app.use('/api', apiLimiter);

  // Health Check
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      status: 'healthy',
      app: 'MITAHARA E-Commerce API',
      timestamp: new Date().toISOString(),
    });
  });

  // API Version 1 Routes
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/products', productRoutes);
  app.use('/api/v1/categories', categoryRoutes);
  app.use('/api/v1/cart', cartRoutes);
  app.use('/api/v1/orders', orderRoutes);
  app.use('/api/v1/coupons', couponRoutes);
  app.use('/api/v1/user', userRoutes);
  app.use('/api/v1/admin', adminRoutes);

  // 404 Route Handler
  app.use('*', (req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: `API endpoint ${req.method} ${req.originalUrl} not found.`,
    });
  });

  // Centralized Error Handling
  app.use(errorHandler);

  return app;
};
