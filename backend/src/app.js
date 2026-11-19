import express from 'express';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { Server as SocketIOServer } from 'socket.io';
import { connectDB } from './config/db.js';
import { initDataStore } from './utils/dataStore.js';
import { initSocket } from './socket/socketHandler.js';

import authRoutes from './routes/auth.js';
import parkingRoutes from './routes/parking.js';
import bookingRoutes from './routes/bookings.js';
import paymentRoutes from './routes/payments.js';
import adminRoutes from './routes/admin.js';
import entryRoutes from './routes/entry.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Setup Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

initSocket(io);

// Middleware - CORS with credential (cookie) support
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  'http://localhost:5000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl) or matching origins
    if (
      !origin || 
      allowedOrigins.includes(origin) || 
      origin.startsWith('http://localhost:') || 
      origin.startsWith('http://127.0.0.1:') ||
      origin.endsWith('.vercel.app') ||
      origin.endsWith('.onrender.com')
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

app.use(cookieParser());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  if (req.path !== '/api/health') {
    console.log(`[API] ${req.method} ${req.path}`);
  }
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'HEALTHY',
    service: 'ParkEase API Backend',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/parking', parkingRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/entry', entryRoutes);

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDist = path.join(__dirname, '../../frontend/dist');

// Serve static frontend build if present
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
}

// 404 & SPA fallback handler
app.use((req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
    return res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} not found` });
  }
  const indexHtml = path.join(frontendDist, 'index.html');
  if (fs.existsSync(indexHtml)) {
    return res.sendFile(indexHtml);
  }
  return res.status(404).send('Frontend build not found');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[ParkEase Error]', err);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;

// Connect DB and start server
(async () => {
  await connectDB();
  initDataStore();

  if (!process.env.VERCEL) {
    server.listen(PORT, () => {
      console.log(`\n=================================================`);
      console.log(`🚗 ParkEase Smart Parking API Server is Live!`);
      console.log(`📡 URL: http://localhost:${PORT}`);
      console.log(`⚡ WebSocket / Socket.IO ready`);
      console.log(`=================================================\n`);
    });
  }
})();

export { app, server };
export default app;
