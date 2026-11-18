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
    const availableSlots = slots.filter(s => s.status === 'available' || s.status === 'AVAILABLE').length;
    const occupiedSlots = slots.filter(s => s.status === 'booked' || s.status === 'BOOKED' || s.status === 'reserved' || s.status === 'RESERVED' || s.status === 'occupied' || s.status === 'OCCUPIED').length;
    const maintenanceSlots = slots.filter(s => s.status === 'unavailable' || s.status === 'UNAVAILABLE' || s.status === 'maintenance' || s.status === 'MAINTENANCE').length;

    const totalRevenue = payments
      .filter(p => p.status === 'SUCCESS')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    const activeBookings = bookings.filter(b => b.bookingStatus === 'ACTIVE' || b.bookingStatus === 'CONFIRMED').length;
    const completedBookings = bookings.filter(b => b.bookingStatus === 'COMPLETED').length;
    const cancelledBookings = bookings.filter(b => b.bookingStatus === 'CANCELLED').length;

    // Compute dynamic Revenue & Bookings by Day for the past 7 days from actual records
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const revenueTrend = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayName = days[d.getDay()];
      const dayStr = d.toISOString().split('T')[0];

      const dayPayments = payments.filter(p => p.status === 'SUCCESS' && p.createdAt && p.createdAt.startsWith(dayStr));
      const dayBookings = bookings.filter(b => b.createdAt && b.createdAt.startsWith(dayStr));

      const dayRev = dayPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
      revenueTrend.push({
        day: dayName,
        date: dayStr,
        revenue: Math.round(dayRev),
        bookings: dayBookings.length
      });
    }

    // Dynamic Occupancy by Hour based on current day bookings
    const hourSlots = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
    const occupancyByHour = hourSlots.map(h => {
      const targetHour = parseInt(h.split(':')[0], 10);
      const matchingActive = bookings.filter(b => {
        if (b.bookingStatus !== 'ACTIVE' && b.bookingStatus !== 'CONFIRMED') return false;
        if (!b.startTime || !b.endTime) return false;
        const sHour = new Date(b.startTime).getHours();
        const eHour = new Date(b.endTime).getHours();
        return (targetHour >= sHour && targetHour <= eHour);
      }).length;

      const rate = totalSpaces > 0 ? Math.round((matchingActive / totalSpaces) * 100) : 0;
      return {
        hour: h,
        occupancy: rate
      };
    });

    // Slot type breakdown
    const slotDistribution = [
      { name: 'Four Wheeler (Car)', count: slots.filter(s => s.type === 'FOUR_WHEELER' || s.type === 'Standard').length, color: '#38BDF8' },
      { name: 'EV Charger', count: slots.filter(s => s.type === 'EV' || s.isEV).length, color: '#6366F1' },
      { name: 'Two Wheeler (Bike)', count: slots.filter(s => s.type === 'TWO_WHEELER').length, color: '#10B981' },
      { name: 'Heavy Vehicle', count: slots.filter(s => s.type === 'HEAVY').length, color: '#F59E0B' }
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
  const { name, tagline, address, city, pricing, amenities, floors, operatingHours } = req.body;
  if (!name || !address) {
    return res.status(400).json({ success: false, message: 'Location name and address are required' });
  }

  const newLoc = {
    _id: `loc_${uuidv4().substring(0, 8)}`,
    name: name.trim(),
    tagline: tagline || 'Smart Secured Parking Facility',
    address: address.trim(),
    city: city ? city.trim() : 'Bangalore',
    coordinates: req.body.coordinates || { lat: 12.9716, lng: 77.5946 },
    distance: req.body.distance || '1.5 km away',
    pricing: pricing || { baseHourly: 50, carHourly: 50, bikeHourly: 20, evHourly: 70 },
    totalSlots: 0,
    availableSlots: 0,
    rating: 5.0,
    reviewCount: 0,
    operatingHours: operatingHours || '24/7 Mon-Sun',
    images: req.body.images && req.body.images.length > 0 ? req.body.images : [
      'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: amenities && amenities.length > 0 ? amenities : ['24/7 CCTV', 'Automated Barrier', 'Security Guard', 'EV Charging'],
    floors: floors && floors.length > 0 ? floors : ['Ground Floor (G)', 'Basement 1 (B1)'],
    createdAt: new Date().toISOString()
  };

  insertOne('locations', newLoc);
  return res.status(201).json({ success: true, message: 'Location created successfully', data: newLoc });
});

router.put('/locations/:id', (req, res) => {
  const { name, tagline, address, city, pricing, amenities, floors, operatingHours, images } = req.body;
  const updated = updateOne('locations', l => l._id === req.params.id, {
    ...(name && { name: name.trim() }),
    ...(tagline !== undefined && { tagline }),
    ...(address && { address: address.trim() }),
    ...(city && { city: city.trim() }),
    ...(pricing && { pricing }),
    ...(amenities && { amenities }),
    ...(floors && { floors }),
    ...(operatingHours && { operatingHours }),
    ...(images && { images }),
    updatedAt: new Date().toISOString()
  });

  if (!updated) {
    return res.status(404).json({ success: false, message: 'Location not found' });
  }
  return res.json({ success: true, message: 'Location updated successfully', data: updated });
});

router.delete('/locations/:id', (req, res) => {
  const locId = req.params.id;
  const removed = deleteOne('locations', l => l._id === locId);
  if (!removed) {
    return res.status(404).json({ success: false, message: 'Location not found' });
  }

  // Cascading cleanup: delete all slots associated with this deleted location
  const allSlots = findMany('slots', s => s.locationId === locId);
  for (const s of allSlots) {
    deleteOne('slots', item => item._id === s._id);
  }

  return res.json({ success: true, message: 'Location and associated slots deleted successfully', data: removed });
});

// 3. Manage Slots CRUD
router.post('/slots', (req, res) => {
  const { locationId, slotNumber, floor, type, hourlyRate, features } = req.body;
  if (!locationId || !slotNumber) {
    return res.status(400).json({ success: false, message: 'Location ID and Slot Number are required' });
  }

  // Check if slot with same number already exists in this location
  const existing = findOne('slots', s => s.locationId === locationId && (s.slotNumber || '').toUpperCase() === slotNumber.toUpperCase());
  if (existing) {
    return res.status(400).json({ success: false, message: `Slot ${slotNumber.toUpperCase()} already exists in this location.` });
  }

  const slotType = type || 'FOUR_WHEELER';
  const newSlot = {
    _id: `slot_${uuidv4().substring(0, 8)}`,
    locationId,
    slotNumber: slotNumber.toUpperCase(),
    floor: floor || 'G',
    type: slotType,
    status: 'available',
    hourlyRate: Number(hourlyRate) || 50,
    features: features || [slotType === 'EV' ? 'EV Charger' : 'Standard Bay'],
    isEV: slotType === 'EV',
    isHandicapped: false,
    currentVehicle: null,
    updatedAt: new Date().toISOString()
  };

  insertOne('slots', newSlot);

  // Update location totalSlots count
  const allLocSlots = findMany('slots', s => s.locationId === locationId);
  const availCount = allLocSlots.filter(s => s.status === 'available' || s.status === 'AVAILABLE').length;
  updateOne('locations', l => l._id === locationId, {
    totalSlots: allLocSlots.length,
    availableSlots: availCount
  });

  broadcastSlotUpdate({
    locationId,
    slotId: newSlot._id,
    slotNumber: newSlot.slotNumber,
    status: 'available',
    updatedAt: new Date().toISOString()
  });

  return res.status(201).json({ success: true, message: 'Slot added successfully', data: newSlot });
});

router.put('/slots/:id', (req, res) => {
  const { status, type, hourlyRate, floor, slotNumber, features } = req.body;
  const updated = updateOne('slots', s => s._id === req.params.id, {
    ...(status && { status: status.toLowerCase() }),
    ...(type && { type, isEV: type === 'EV' }),
    ...(hourlyRate && { hourlyRate: Number(hourlyRate) }),
    ...(floor && { floor }),
    ...(slotNumber && { slotNumber: slotNumber.toUpperCase() }),
    ...(features && { features }),
    updatedAt: new Date().toISOString()
  });

  if (!updated) {
    return res.status(404).json({ success: false, message: 'Slot not found' });
  }

  // Recalculate location available slots
  const allLocSlots = findMany('slots', s => s.locationId === updated.locationId);
  const availCount = allLocSlots.filter(s => s.status === 'available' || s.status === 'AVAILABLE').length;
  updateOne('locations', l => l._id === updated.locationId, {
    totalSlots: allLocSlots.length,
    availableSlots: availCount
  });

  broadcastSlotUpdate({
    locationId: updated.locationId,
    slotId: updated._id,
    slotNumber: updated.slotNumber,
    status: updated.status,
    updatedAt: new Date().toISOString()
  });

  return res.json({ success: true, message: 'Slot updated successfully', data: updated });
});

router.delete('/slots/:id', (req, res) => {
  const slot = findOne('slots', s => s._id === req.params.id);
  if (!slot) {
    return res.status(404).json({ success: false, message: 'Slot not found' });
  }

  const removed = deleteOne('slots', s => s._id === req.params.id);

  // Recalculate location counts
  const allLocSlots = findMany('slots', s => s.locationId === slot.locationId);
  const availCount = allLocSlots.filter(s => s.status === 'available' || s.status === 'AVAILABLE').length;
  updateOne('locations', l => l._id === slot.locationId, {
    totalSlots: allLocSlots.length,
    availableSlots: availCount
  });

  return res.json({ success: true, message: 'Slot deleted successfully', data: removed });
});

// 4. View All Bookings (with Date, Location, and Status filters)
router.get('/bookings', (req, res) => {
  const { date, locationId, status } = req.query;
  let bookings = findMany('bookings');

  if (status && status !== 'ALL') {
    bookings = bookings.filter(b => (b.bookingStatus || '').toUpperCase() === status.toUpperCase());
  }

  if (locationId && locationId !== 'ALL') {
    bookings = bookings.filter(b => b.locationId === locationId);
  }

  if (date) {
    bookings = bookings.filter(b => (b.createdAt || '').startsWith(date) || (b.startTime || '').startsWith(date));
  }

  bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return res.json({ success: true, count: bookings.length, data: bookings });
});

// 5. Admin Cancel Booking
router.post('/bookings/:id/cancel', (req, res) => {
  const booking = findOne('bookings', b => b._id === req.params.id);
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }

  if (booking.bookingStatus === 'CANCELLED') {
    return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
  }

  const updatedBooking = updateOne('bookings', b => b._id === booking._id, {
    bookingStatus: 'CANCELLED',
    paymentStatus: 'REFUNDED',
    cancellationReason: req.body.reason || 'Admin Cancelled',
    updatedAt: new Date().toISOString()
  });

  // Release the slot back to available
  if (booking.slotId) {
    updateOne('slots', s => s._id === booking.slotId, {
      status: 'available',
      isOccupied: false,
      currentBookingId: null,
      currentVehicle: null,
      updatedAt: new Date().toISOString()
    });

    broadcastSlotUpdate({
      locationId: booking.locationId,
      slotId: booking.slotId,
      slotNumber: booking.slotNumber,
      status: 'available',
      updatedAt: new Date().toISOString()
    });
  }

  return res.json({ success: true, message: 'Booking cancelled and slot released successfully', data: updatedBooking });
});

// 6. View All Users
router.get('/users', (req, res) => {
  const users = findMany('users').map(u => {
    const safe = { ...u };
    delete safe.passwordHash;
    return safe;
  });
  return res.json({ success: true, count: users.length, data: users });
});

// 7. Get specific user's booking history
router.get('/users/:id/bookings', (req, res) => {
  const userBookings = findMany('bookings', b => b.userId === req.params.id);
  userBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return res.json({ success: true, count: userBookings.length, data: userBookings });
});

// 8. Update User Role
router.put('/users/:id/role', (req, res) => {
  const { role } = req.body;
  if (!role || !['admin', 'user'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Role must be either "admin" or "user"' });
  }

  const updated = updateOne('users', u => u._id === req.params.id, {
    role,
    updatedAt: new Date().toISOString()
  });

  if (!updated) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const userSafe = { ...updated };
  delete userSafe.passwordHash;
  return res.json({ success: true, message: `User role updated to ${role}`, data: userSafe });
});

// 9. View All Payments
router.get('/payments', (req, res) => {
  let payments = findMany('payments');
  payments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return res.json({ success: true, count: payments.length, data: payments });
});

export default router;
