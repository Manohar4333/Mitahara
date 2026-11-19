import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { ENV } from './env.js';

let io: SocketIOServer | null = null;

export const initSocket = (httpServer: HttpServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: [ENV.FRONTEND_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'],
      credentials: true,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join order tracking room
    socket.on('join_order_room', (orderId: string) => {
      if (orderId) {
        socket.join(`order:${orderId}`);
        console.log(`[Socket.IO] Socket ${socket.id} joined room: order:${orderId}`);
        socket.emit('joined_room', { orderId });
      }
    });

    // Leave order tracking room
    socket.on('leave_order_room', (orderId: string) => {
      if (orderId) {
        socket.leave(`order:${orderId}`);
        console.log(`[Socket.IO] Socket ${socket.id} left room: order:${orderId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.IO has not been initialized yet!');
  }
  return io;
};

export const emitOrderUpdate = (orderId: string, updateData: any): void => {
  if (io) {
    io.to(`order:${orderId}`).emit('order_status_updated', updateData);
    console.log(`[Socket.IO] Emitted order_status_updated to room: order:${orderId}`);
  }
};
