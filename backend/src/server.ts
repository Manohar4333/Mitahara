import dns from "node:dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);


import http from 'http';
import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { initSocket } from './config/socket.js';
import { ENV } from './config/env.js';
import { seedDatabase } from './utils/seed.js';

const startServer = async () => {
  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Automatically seed essential data if needed
    await seedDatabase();

    // 3. Create Express App & HTTP Server
    const app = createApp();
    const server = http.createServer(app);

    // 4. Initialize Socket.IO
    initSocket(server);

    // 5. Start Listening
    server.listen(ENV.PORT, () => {
      console.log(`=======================================================`);
      console.log(`  MITAHARA Backend Server Running on Port: ${ENV.PORT}`);
      console.log(`  Environment: ${ENV.NODE_ENV}`);
      console.log(`  REST API Base: http://localhost:${ENV.PORT}/api/v1`);
      console.log(`  Socket.IO: Enabled with room-based order tracking`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('Fatal: Failed to start MITAHARA server:', error);
    process.exit(1);
  }
};

startServer();
