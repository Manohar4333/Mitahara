
import http from 'http';
import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { initSocket } from './config/socket.js';
import { ENV } from './config/env.js';

const startServer = async () => {
  try {
    await connectDB();

    const app = createApp();
    const server = http.createServer(app);

    // Socket.IO for local development
    initSocket(server);

    server.listen(ENV.PORT, () => {
      console.log('====================================');
      console.log('MITAHARA Backend Server Running');
      console.log(`Port: ${ENV.PORT}`);
      console.log(`Environment: ${ENV.NODE_ENV}`);
      console.log('REST API: /api/v1');
      console.log('Socket.IO: Enabled');
      console.log('====================================');
    });
  } catch (error) {
    console.error('Failed to start MITAHARA:', error);
    process.exitCode = 1;
  }
};

startServer();
