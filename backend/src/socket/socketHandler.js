let ioInstance = null;

export const initSocket = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join room for a specific parking location
    socket.on('join_location', (locationId) => {
      socket.join(`location_${locationId}`);
      console.log(`[Socket.IO] Client ${socket.id} joined location_${locationId}`);
    });

    socket.on('leave_location', (locationId) => {
      socket.leave(`location_${locationId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });
};

export const broadcastSlotUpdate = (slotData) => {
  if (!ioInstance) return;

  // Broadcast globally and to location room
  ioInstance.emit('slot_updated', slotData);
  if (slotData.locationId) {
    ioInstance.to(`location_${slotData.locationId}`).emit('slot_updated', slotData);
  }
};
