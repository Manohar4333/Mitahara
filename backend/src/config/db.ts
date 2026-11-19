
import mongoose from 'mongoose';
import { ENV } from './env.js';

let connectionPromise: Promise<typeof mongoose> | null = null;

export const connectDB = async (): Promise<void> => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!ENV.MONGO_URI || !ENV.MONGO_URI.trim()) {
    throw new Error('MONGO_URI is missing. Configure MongoDB Atlas.');
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(ENV.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10,
    }).catch((error) => {
      connectionPromise = null;
      throw error;
    });
  }

  try {
    await connectionPromise;
    console.log('MITAHARA MongoDB Atlas connected successfully.');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    throw error;
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  connectionPromise = null;
};
