import jwt from 'jsonwebtoken';
import { findOne, updateOne } from '../utils/dataStore.js';

const JWT_SECRET = process.env.JWT_SECRET || 'parkease_jwt_secret_super_secure_key_2026';

// List of designated admin emails configurable via environment or default
export const getAdminEmails = () => {
  const envAdmins = process.env.ADMIN_EMAILS
    ? process.env.ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase())
    : [];
  return ['admin@parkease.com', 'asjeevaaslm@gmail.com', 'asjeevaa@gmail.com', ...envAdmins];
};

export const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const protect = (req, res, next) => {
  let token;

  // 1. Check HttpOnly cookie first for persistent browser session
  if (req.cookies && (req.cookies.parkease_token || req.cookies.token)) {
    token = req.cookies.parkease_token || req.cookies.token;
  }
  // 2. Fall back to Authorization Bearer header
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no session token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = findOne('users', u => u._id === decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User belonging to token no longer exists' });
    }

    // Auto-sync designated admin account role in database if configured
    const adminEmails = getAdminEmails();
    if (adminEmails.includes((user.email || '').toLowerCase()) && user.role !== 'admin') {
      user.role = 'admin';
      updateOne('users', u => u._id === user._id, { role: 'admin' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Session token invalid or expired' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Access denied: Admin privileges required' });
};
