import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io('/', {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log('[Socket.IO Frontend] Connected:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket.IO Frontend] Disconnected:', reason);
    });
  }
  return socket;
};

export const joinOrderRoom = (orderId: string): void => {
  const s = getSocket();
  s.emit('join_order_room', orderId);
};

export const leaveOrderRoom = (orderId: string): void => {
  const s = getSocket();
  s.emit('leave_order_room', orderId);
};
