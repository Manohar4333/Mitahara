import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ENV } from './env.js';

let mongoMemoryServer: MongoMemoryServer | null = null;

export const connectDB = async (): Promise<void> => {
  try {
    let uri = ENV.MONGO_URI;

    if (uri && uri.trim() !== '') {
      console.log('Connecting to provided MongoDB URI...');
      await mongoose.connect(uri);
      console.log('Connected to MongoDB successfully.');
      return;
    }

    console.log('No MONGO_URI provided in environment. Starting embedded MongoDB Memory Server for seamless development/testing...');
    mongoMemoryServer = await MongoMemoryServer.create();
    uri = mongoMemoryServer.getUri();
    await mongoose.connect(uri);
    console.log(`Connected to Embedded MongoDB at: ${uri}`);
  } catch (error) {
    console.error('Failed to connect to MongoDB with primary URI:', error);
    try {
      if (!mongoMemoryServer) {
        console.log('Falling back to embedded MongoDB Memory Server...');
        mongoMemoryServer = await MongoMemoryServer.create();
        const fallbackUri = mongoMemoryServer.getUri();
        await mongoose.connect(fallbackUri);
        console.log(`Connected to Fallback Embedded MongoDB at: ${fallbackUri}`);
      }
    } catch (fallbackError) {
      console.error('Critical: Could not connect to any MongoDB instance:', fallbackError);
      process.exit(1);
    }
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
    }
  } catch (err) {
    console.error('Error during MongoDB disconnect:', err);
  }
};
