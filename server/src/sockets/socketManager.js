const socketIo = require('socket.io');

let io = null;

function initSockets(server) {
  io = socketIo(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected to Socket.IO: ${socket.id}`);

    // Join room for specific project or user
    socket.on('join_project', (projectId) => {
      socket.join(`project_${projectId}`);
      console.log(`Socket ${socket.id} joined project_${projectId}`);
    });

    socket.on('leave_project', (projectId) => {
      socket.leave(`project_${projectId}`);
    });

    socket.on('join_user', (userId) => {
      socket.join(`user_${userId}`);
      console.log(`Socket ${socket.id} joined user_${userId}`);
    });

    // Real-time task movement broadcast across project members
    socket.on('task_moved', (data) => {
      socket.to(`project_${data.projectId}`).emit('task_updated', data);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

function getIo() {
  if (!io) {
    throw new Error('Socket.io has not been initialized!');
  }
  return io;
}

module.exports = {
  initSockets,
  getIo
};
