import jwt from 'jsonwebtoken';
import { findOne } from '../utils/dataStore.js';

const JWT_SECRET = process.env.JWT_SECRET || 'parkease_jwt_secret_super_secure_key_2026';

export const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const protect = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = findOne('users', u => u._id === decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User belonging to token no longer exists' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Access denied: Admin privileges required' });
};
