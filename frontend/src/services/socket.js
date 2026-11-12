import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  transports: ['websocket', 'polling'],
});

export const joinLocationRoom = (locationId) => {
  if (locationId) {
    socket.emit('join_location', locationId);
  }
};

export const leaveLocationRoom = (locationId) => {
  if (locationId) {
    socket.emit('leave_location', locationId);
  }
};
