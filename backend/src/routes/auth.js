import express from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { findOne, insertOne, updateOne } from '../utils/dataStore.js';
import { generateToken, protect } from '../middleware/auth.js';

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    const existing = findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const newUser = {
      _id: `usr_${uuidv4().substring(0, 8)}`,
      name,
      email: email.toLowerCase(),
      passwordHash,
      phone: phone || '',
      role: role === 'admin' ? 'admin' : 'user',
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80`,
      vehicles: [],
      favorites: [],
      createdAt: new Date().toISOString()
    };

    insertOne('users', newUser);

    const token = generateToken(newUser);
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

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user);
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

// Get current user profile
router.get('/me', protect, (req, res) => {
  const userSafe = { ...req.user };
  delete userSafe.passwordHash;
  return res.json({ success: true, data: userSafe });
});

// Update profile
router.put('/profile', protect, (req, res) => {
  const { name, phone, avatar } = req.body;
  const updated = updateOne('users', u => u._id === req.user._id, {
    ...(name && { name }),
    ...(phone && { phone }),
    ...(avatar && { avatar })
  });

  const userSafe = { ...updated };
  delete userSafe.passwordHash;
  return res.json({ success: true, message: 'Profile updated successfully', data: userSafe });
});

// Add vehicle
router.post('/vehicles', protect, (req, res) => {
  const { plateNumber, makeModel, type, color } = req.body;
  if (!plateNumber || !makeModel) {
    return res.status(400).json({ success: false, message: 'Plate number and vehicle model are required' });
  }

  const vehicles = req.user.vehicles || [];
  const newVehicle = {
    id: `veh_${uuidv4().substring(0, 6)}`,
    plateNumber: plateNumber.toUpperCase().trim(),
    makeModel,
    type: type || 'Car',
    color: color || 'Silver'
  };

  vehicles.push(newVehicle);
  updateOne('users', u => u._id === req.user._id, { vehicles });

  return res.status(201).json({ success: true, message: 'Vehicle added successfully', data: newVehicle });
});

// Remove vehicle
router.delete('/vehicles/:id', protect, (req, res) => {
  const vehicleId = req.params.id;
  const vehicles = (req.user.vehicles || []).filter(v => v.id !== vehicleId);
  updateOne('users', u => u._id === req.user._id, { vehicles });
  return res.json({ success: true, message: 'Vehicle removed', data: vehicles });
});

// Toggle favorite location
router.post('/favorites/:locationId', protect, (req, res) => {
  const { locationId } = req.params;
  let favorites = req.user.favorites || [];
  const exists = favorites.includes(locationId);

  if (exists) {
    favorites = favorites.filter(id => id !== locationId);
  } else {
    favorites.push(locationId);
  }

  updateOne('users', u => u._id === req.user._id, { favorites });
  return res.json({
    success: true,
    message: exists ? 'Removed from favorites' : 'Added to favorites',
    data: { favorites }
  });
});

export default router;
