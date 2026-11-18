import express from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { findOne, insertOne, updateOne } from '../utils/dataStore.js';
import { generateToken, protect, requireAdmin, getAdminEmails } from '../middleware/auth.js';

const router = express.Router();

// Helper to set persistent authentication cookie
const setAuthCookie = (res, token) => {
  res.cookie('parkease_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days persistent session
  });
};

// Helper to clear authentication cookie
const clearAuthCookie = (res) => {
  res.clearCookie('parkease_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });
};

// 1. Register new user (Strictly for normal users)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = findOne('users', u => u.email.toLowerCase() === normalizedEmail);
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    // Role enforcement: Public registrations are strictly assigned 'user' role
    // Only pre-configured designated admin emails receive 'admin'
    const adminEmails = getAdminEmails();
    const assignedRole = adminEmails.includes(normalizedEmail) ? 'admin' : 'user';

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const newUser = {
      _id: `usr_${uuidv4().substring(0, 8)}`,
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      phone: (phone || '').trim(),
      role: assignedRole,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80`,
      vehicles: [],
      favorites: [],
      createdAt: new Date().toISOString()
    };

    insertOne('users', newUser);

    const token = generateToken(newUser);
    setAuthCookie(res, token);

    const userSafe = { ...newUser };
    delete userSafe.passwordHash;

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      data: {
        token,
        user: userSafe
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

// 2. Standard User Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = findOne('users', u => u.email.toLowerCase() === normalizedEmail);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Synchronize designated admin account role in database if configured
    const adminEmails = getAdminEmails();
    if (adminEmails.includes(normalizedEmail) && user.role !== 'admin') {
      user.role = 'admin';
      updateOne('users', u => u._id === user._id, { role: 'admin' });
    }

    const token = generateToken(user);
    setAuthCookie(res, token);

    const userSafe = { ...user };
    delete userSafe.passwordHash;

    return res.json({
      success: true,
      message: 'Logged in successfully',
      data: {
        token,
        user: userSafe
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// 3. Dedicated Admin Login (Enforces admin role verification on backend)
router.post('/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Admin email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = findOne('users', u => u.email.toLowerCase() === normalizedEmail);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid administrator credentials' });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid administrator credentials' });
    }

    // Auto-sync designated admin emails
    const adminEmails = getAdminEmails();
    if (adminEmails.includes(normalizedEmail) && user.role !== 'admin') {
      user.role = 'admin';
      updateOne('users', u => u._id === user._id, { role: 'admin' });
    }

    // Strict Backend Admin Role Check
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: You do not possess administrator credentials. Please sign in via the User Portal.'
      });
    }

    const token = generateToken(user);
    setAuthCookie(res, token);

    const userSafe = { ...user };
    delete userSafe.passwordHash;

    return res.json({
      success: true,
      message: 'Administrator authentication successful',
      data: {
        token,
        user: userSafe
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during admin authentication' });
  }
});

// 4. Logout
router.post('/logout', (req, res) => {
  clearAuthCookie(res);
  return res.json({ success: true, message: 'Logged out successfully' });
});

// 5. Get current user profile (Persistent session restoration)
router.get('/me', protect, (req, res) => {
  const userSafe = { ...req.user };
  delete userSafe.passwordHash;
  return res.json({ success: true, data: userSafe });
});

// 6. Update profile
router.put('/profile', protect, (req, res) => {
  const { name, phone, avatar } = req.body;
  // Users cannot modify their role here
  const updated = updateOne('users', u => u._id === req.user._id, {
    ...(name && { name: name.trim() }),
    ...(phone && { phone: phone.trim() }),
    ...(avatar && { avatar })
  });

  const userSafe = { ...updated };
  delete userSafe.passwordHash;
  return res.json({ success: true, message: 'Profile updated successfully', data: userSafe });
});

// 7. Change password (mandatory for temporary password reset)
router.post('/change-password', protect, async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    if (newPassword === '123456789') {
      return res.status(400).json({ success: false, message: 'New password cannot be the temporary password. Please choose a different, secure password.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(newPassword, salt);

    const updated = updateOne('users', u => u._id === req.user._id, {
      passwordHash,
      mustChangePassword: false,
      updatedAt: new Date().toISOString()
    });

    const userSafe = { ...updated };
    delete userSafe.passwordHash;

    return res.json({
      success: true,
      message: 'Password changed successfully! You may now proceed.',
      data: { user: userSafe }
    });
  } catch (error) {
    console.error('Password change error:', error);
    return res.status(500).json({ success: false, message: 'Server error while updating password' });
  }
});

// 8. Promote a user to admin (Only callable by an existing Admin)
router.post('/promote', protect, requireAdmin, (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const targetUser = findOne('users', u => u.email.toLowerCase() === normalizedEmail);
  if (!targetUser) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const updated = updateOne('users', u => u._id === targetUser._id, {
    role: 'admin',
    updatedAt: new Date().toISOString()
  });

  return res.json({
    success: true,
    message: `User ${updated.name} (${updated.email}) is now an Administrator`,
    data: {
      userId: updated._id,
      email: updated.email,
      role: updated.role
    }
  });
});

export default router;
