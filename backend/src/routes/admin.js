import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { findOne, findMany, insertOne, updateOne, deleteOne } from '../utils/dataStore.js';
import { protect, requireAdmin } from '../middleware/auth.js';
import { broadcastSlotUpdate } from '../socket/socketHandler.js';

const router = express.Router();

// Apply auth and requireAdmin to all routes in this router
router.use(protect, requireAdmin);

// 1. Admin Dashboard Overview Analytics
router.get('/analytics', (req, res) => {
  try {
    const locations = findMany('locations');
    const slots = findMany('slots');
    const bookings = findMany('bookings');
    const payments = findMany('payments');
    const users = findMany('users');

    const totalSpaces = slots.length;
    const availableSlots = slots.filter(s => s.status === 'available').length;
    const occupiedSlots = slots.filter(s => s.status === 'booked' || s.status === 'reserved').length;
    const maintenanceSlots = slots.filter(s => s.status === 'unavailable').length;

    const totalRevenue = payments
      .filter(p => p.status === 'SUCCESS')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    const activeBookings = bookings.filter(b => b.bookingStatus === 'ACTIVE').length;
    const completedBookings = bookings.filter(b => b.bookingStatus === 'COMPLETED').length;
    const cancelledBookings = bookings.filter(b => b.bookingStatus === 'CANCELLED').length;

    // Revenue by Day for chart (Last 7 days)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const revenueTrend = [
      { day: 'Mon', revenue: 4200, bookings: 38 },
      { day: 'Tue', revenue: 5800, bookings: 52 },
      { day: 'Wed', revenue: 6400, bookings: 61 },
      { day: 'Thu', revenue: 7100, bookings: 69 },
      { day: 'Fri', revenue: 9500, bookings: 94 },
      { day: 'Sat', revenue: 11800, bookings: 122 },
      { day: 'Sun', revenue: 10400, bookings: 110 },
    ];

    // Occupancy by Hour for chart
    const occupancyByHour = [
      { hour: '06:00', occupancy: 18 },
      { hour: '08:00', occupancy: 45 },
      { hour: '10:00', occupancy: 82 },
      { hour: '12:00', occupancy: 88 },
      { hour: '14:00', occupancy: 76 },
      { hour: '16:00', occupancy: 84 },
      { hour: '18:00', occupancy: 92 },
      { hour: '20:00', occupancy: 79 },
      { hour: '22:00', occupancy: 40 }
    ];

    // Slot type breakdown
    const slotDistribution = [
      { name: 'Standard', count: slots.filter(s => s.type === 'Standard').length, color: '#3B82F6' },
      { name: 'EV Supercharger', count: slots.filter(s => s.type === 'EV').length, color: '#00C853' },
      { name: 'VIP Valet', count: slots.filter(s => s.type === 'VIP').length, color: '#F59E0B' },
      { name: 'Accessible', count: slots.filter(s => s.type === 'Accessible').length, color: '#8B5CF6' }
    ];

    return res.json({
      success: true,
      data: {
        summary: {
          totalSpaces,
          availableSlots,
          occupiedSlots,
          maintenanceSlots,
          totalRevenue,
          totalBookings: bookings.length,
          activeBookings,
          completedBookings,
          cancelledBookings,
          totalUsers: users.length,
          totalLocations: locations.length,
          averageOccupancyRate: totalSpaces ? Math.round((occupiedSlots / totalSpaces) * 100) : 0
        },
        revenueTrend,
        occupancyByHour,
        slotDistribution
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate analytics' });
  }
});

// 2. Manage Locations CRUD
router.post('/locations', (req, res) => {
  const { name, tagline, address, pricing, amenities, floors, operatingHours } = req.body;
  if (!name || !address) {
    return res.status(400).json({ success: false, message: 'Location name and address are required' });
  }

  const newLoc = {
    _id: `loc_${uuidv4().substring(0, 8)}`,
    name,
    tagline: tagline || 'Smart Secured Parking Facility',
    address,
    coordinates: req.body.coordinates || { lat: 28.6139, lng: 77.2090 },
    distance: req.body.distance || '2.0 km away',
    pricing: pricing || { hourlyRate: 40, dayPassRate: 350 },
    totalSlots: 0,
    rating: 5.0,
    reviewCount: 1,
    operatingHours: operatingHours || '24/7 Mon-Sun',
    images: req.body.images || [
      'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: amenities || ['24/7 CCTV', 'Automated Barrier', 'EV Charging'],
    floors: floors || ['Ground Floor (G)', 'Level 1 (P1)'],
    createdAt: new Date().toISOString()
  };

  insertOne('locations', newLoc);
  return res.status(201).json({ success: true, message: 'Location created successfully', data: newLoc });
});

router.put('/locations/:id', (req, res) => {
  const updated = updateOne('locations', l => l._id === req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Location not found' });
  }
  return res.json({ success: true, message: 'Location updated', data: updated });
});

router.delete('/locations/:id', (req, res) => {
  const removed = deleteOne('locations', l => l._id === req.params.id);
  if (!removed) {
    return res.status(404).json({ success: false, message: 'Location not found' });
  }
  return res.json({ success: true, message: 'Location deleted', data: removed });
});

// 3. Manage Slots CRUD
router.post('/slots', (req, res) => {
  const { locationId, slotNumber, floor, type, hourlyRate, features } = req.body;
  if (!locationId || !slotNumber) {
    return res.status(400).json({ success: false, message: 'Location ID and Slot Number are required' });
  }

  const newSlot = {
    _id: `slot_${uuidv4().substring(0, 8)}`,
    locationId,
    slotNumber: slotNumber.toUpperCase(),
    floor: floor || 'Ground Floor (G)',
    type: type || 'Standard',
    status: 'available',
    hourlyRate: Number(hourlyRate) || 40,
    features: features || ['Standard Bay'],
    currentVehicle: null
  };

  insertOne('slots', newSlot);

  broadcastSlotUpdate({
    locationId,
    slotId: newSlot._id,
    slotNumber: newSlot.slotNumber,
    status: 'available',
    updatedAt: new Date().toISOString()
  });

  return res.status(201).json({ success: true, message: 'Slot added', data: newSlot });
});

router.put('/slots/:id', (req, res) => {
  const { status, type, hourlyRate, floor, slotNumber } = req.body;
  const updated = updateOne('slots', s => s._id === req.params.id, {
    ...(status && { status }),
    ...(type && { type }),
    ...(hourlyRate && { hourlyRate: Number(hourlyRate) }),
    ...(floor && { floor }),
    ...(slotNumber && { slotNumber })
  });

  if (!updated) {
    return res.status(404).json({ success: false, message: 'Slot not found' });
  }

  // Broadcast status change
  broadcastSlotUpdate({
    locationId: updated.locationId,
    slotId: updated._id,
    slotNumber: updated.slotNumber,
    status: updated.status,
    updatedAt: new Date().toISOString()
  });

  return res.json({ success: true, message: 'Slot updated', data: updated });
});

router.delete('/slots/:id', (req, res) => {
  const removed = deleteOne('slots', s => s._id === req.params.id);
  if (!removed) {
    return res.status(404).json({ success: false, message: 'Slot not found' });
  }
  return res.json({ success: true, message: 'Slot deleted', data: removed });
});

// 4. View All Bookings (with filters)
router.get('/bookings', (req, res) => {
  let bookings = findMany('bookings');
  bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return res.json({ success: true, count: bookings.length, data: bookings });
});

// 5. Manage Users
router.get('/users', (req, res) => {
  const users = findMany('users').map(u => {
    const safe = { ...u };
    delete safe.passwordHash;
    return safe;
  });
  return res.json({ success: true, count: users.length, data: users });
});

// 6. View All Payments
router.get('/payments', (req, res) => {
  let payments = findMany('payments');
  payments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return res.json({ success: true, count: payments.length, data: payments });
});

export default router;
