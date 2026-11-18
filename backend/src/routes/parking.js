import express from 'express';
import { findOne, findMany } from '../utils/dataStore.js';

const router = express.Router();

// Get all parking locations (with search & occupancy stats)
router.get('/locations', (req, res) => {
  try {
    const { search, amenity } = req.query;
    let locations = findMany('locations');
    const allSlots = findMany('slots');

    // Calculate dynamic availability for each location
    const locationsWithStats = locations.map(loc => {
      const locSlots = allSlots.filter(s => s.locationId === loc._id);
      const availableCount = locSlots.filter(s => s.status === 'available').length;
      const bookedCount = locSlots.filter(s => s.status === 'booked' || s.status === 'reserved').length;
      const evSlots = locSlots.filter(s => s.type === 'EV').length;

      return {
        ...loc,
        totalSlots: locSlots.length,
        availableSlots: availableCount,
        occupiedSlots: bookedCount,
        evSlotsCount: evSlots,
        occupancyRate: locSlots.length ? Math.round((bookedCount / locSlots.length) * 100) : 0
      };
    });

    let filtered = locationsWithStats;
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(l =>
        l.name.toLowerCase().includes(q) ||
        l.address.toLowerCase().includes(q) ||
        (l.tagline && l.tagline.toLowerCase().includes(q))
      );
    }

    if (amenity) {
      filtered = filtered.filter(l => l.amenities && l.amenities.some(a => a.toLowerCase().includes(amenity.toLowerCase())));
    }

    return res.json({ success: true, count: filtered.length, data: filtered });
  } catch (error) {
    console.error('Error fetching locations:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve parking locations' });
  }
});

// Get single location details
router.get('/locations/:id', (req, res) => {
  try {
    const loc = findOne('locations', l => l._id === req.params.id);
    if (!loc) {
      return res.status(404).json({ success: false, message: 'Parking location not found' });
    }

    const locSlots = findMany('slots', s => s.locationId === loc._id);
    const availableCount = locSlots.filter(s => s.status === 'available').length;
    const bookedCount = locSlots.filter(s => s.status === 'booked' || s.status === 'reserved').length;

    return res.json({
      success: true,
      data: {
        ...loc,
        totalSlots: locSlots.length,
        availableSlots: availableCount,
        occupiedSlots: bookedCount,
        occupancyRate: locSlots.length ? Math.round((bookedCount / locSlots.length) * 100) : 0
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get slots for a specific location (optionally filtered by floor and requested time window)
router.get('/locations/:id/slots', (req, res) => {
  try {
    const { floor, startTime, endTime } = req.query;
    const locationId = req.params.id;

    let slots = findMany('slots', s => s.locationId === locationId);
    if (floor && floor !== 'All Floors') {
      slots = slots.filter(s => s.floor === floor);
    }

    // If specific date/time is provided, check against active bookings for that slot to prevent overlap
    if (startTime && endTime) {
      const reqStart = new Date(startTime).getTime();
      const reqEnd = new Date(endTime).getTime();
      const bookings = findMany('bookings', b => b.locationId === locationId && (b.bookingStatus === 'ACTIVE' || b.bookingStatus === 'CONFIRMED'));

      slots = slots.map(slot => {
        // If slot is marked unavailable by admin
        if (slot.status === 'unavailable') return slot;

        // Check if there is an overlapping booking
        const hasOverlap = bookings.some(b => {
          if (b.slotId !== slot._id) return false;
          const bStart = new Date(b.startTime).getTime();
          const bEnd = new Date(b.endTime).getTime();
          return (reqStart < bEnd && reqEnd > bStart);
        });

        return {
          ...slot,
          status: hasOverlap ? 'booked' : slot.status
        };
      });
    }

    return res.json({ success: true, count: slots.length, data: slots });
  } catch (error) {
    console.error('Error fetching slots:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch slots' });
  }
});

export default router;
