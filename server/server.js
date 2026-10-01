const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { initSockets } = require('./src/sockets/socketManager');
const errorHandler = require('./src/middleware/errorMiddleware');

// Route imports
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const projectRoutes = require('./src/routes/projectRoutes');
const taskRoutes = require('./src/routes/taskRoutes');
const teamRoutes = require('./src/routes/teamRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const commentController = require('./src/controllers/commentController');
const attachmentController = require('./src/controllers/attachmentController');
const authenticateToken = require('./src/middleware/authMiddleware');
const upload = require('./src/middleware/uploadMiddleware');

const app = express();
const server = http.createServer(app);

// Initialize WebSockets
initSockets(server);

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Body Parsers & Static Files
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root welcome endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to WorkSphere Backend API Engine',
    version: '1.0.0',
    documentation: 'Use /health or /api/health for system status, or /api/auth for authentication.'
  });
});

// Health Check API (accessible at both /health and /api/health)
app.get(['/health', '/api/health'], (req, res) => {
  res.status(200).json({
    status: 'online',
    platform: 'WorkSphere Backend API Engine',
    timestamp: new Date()
  });
});

// API Routes mounting
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);

// Additional nested routes for comments & attachments on tasks
app.get('/api/tasks/:taskId/comments', authenticateToken, commentController.getComments);
app.post('/api/tasks/:taskId/comments', authenticateToken, commentController.addComment);
app.post('/api/tasks/:taskId/attachments', authenticateToken, upload.single('file'), attachmentController.uploadAttachment);
app.get('/api/attachments/:id/download', authenticateToken, attachmentController.downloadAttachment);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, error: 'Requested API endpoint not found.' });
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 WorkSphere Backend Server running on http://localhost:${PORT}`);
  console.log(`📡 Socket.IO Real-time service attached on port ${PORT}`);
});

module.exports = { app, server };
