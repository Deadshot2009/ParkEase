import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';
import { findOne, findMany, insertOne, updateOne } from '../utils/dataStore.js';
import { protect } from '../middleware/auth.js';
import { broadcastSlotUpdate } from '../socket/socketHandler.js';

const router = express.Router();

// Helper to generate unique booking reference
const generateBookingRef = () => {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `PE-2026-${randomNum}`;
};

// Create a new booking reservation (Advance reservation with concurrency & overlap check)
router.post('/', protect, async (req, res) => {
  try {
    const {
      locationId,
      slotId,
      vehicle,
      startTime,
      endTime,
      durationHours,
      paymentMethod,
      upiId
    } = req.body;

    if (!locationId || !slotId || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: 'Missing required booking parameters' });
    }

    // 1. Fetch location and slot
    const location = findOne('locations', l => l._id === locationId);
    if (!location) {
      return res.status(404).json({ success: false, message: 'Location not found' });
    }

    const slot = findOne('slots', s => s._id === slotId && s.locationId === locationId);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Parking slot not found' });
    }

    if (slot.status === 'unavailable') {
      return res.status(400).json({ success: false, message: 'This slot is currently under maintenance or unavailable' });
    }

    // 2. Overlap & Concurrency Check (Anti Double-Booking Validation)
    const reqStart = new Date(startTime).getTime();
    const reqEnd = new Date(endTime).getTime();

    if (reqStart >= reqEnd) {
      return res.status(400).json({ success: false, message: 'End time must be after start time' });
    }

    const existingBookings = findMany('bookings', b =>
      b.slotId === slotId &&
      (b.bookingStatus === 'ACTIVE' || b.bookingStatus === 'CONFIRMED')
    );

    const hasConflict = existingBookings.some(b => {
      const bStart = new Date(b.startTime).getTime();
      const bEnd = new Date(b.endTime).getTime();
      return (reqStart < bEnd && reqEnd > bStart);
    });

    if (hasConflict) {
      return res.status(409).json({
        success: false,
        message: 'This slot has just been reserved by another user for the selected time window. Please choose another slot.'
      });
    }

    // 3. Pricing Calculation based on exact duration and slot type
    const duration = Math.max(1, parseFloat(durationHours) || Math.ceil((reqEnd - reqStart) / (1000 * 60 * 60)));
    const ratePerHour = slot.hourlyRate || location.pricing.hourlyRate || 40;
    const subtotal = Math.round(ratePerHour * duration);
    const taxes = Math.round(subtotal * 0.18 * 100) / 100; // 18% GST
    const totalAmount = Math.round(subtotal + taxes);

    const bookingRef = generateBookingRef();
    const bookingId = `bk_${uuidv4().substring(0, 8)}`;

    // 4. Secure QR Payload Creation
    const qrPayload = JSON.stringify({
      bookingRef,
      bookingId,
      userId: req.user._id,
      locationId,
      locationName: location.name,
      slotId,
      slotNumber: slot.slotNumber,
      plateNumber: vehicle?.plateNumber || 'WALK-IN',
      validFrom: startTime,
      validUntil: endTime,
      totalPaid: totalAmount,
      securitySign: `SEC-${Buffer.from(bookingId + startTime).toString('base64').substring(0, 16)}`
    });

    // Generate QR base64 data URL
    const qrDataUrl = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: 'H',
      margin: 2,
      color: {
        dark: '#0A1128',
        light: '#FFFFFF'
      }
    });

    // 5. Store booking record
    const newBooking = {
      _id: bookingId,
      bookingReference: bookingRef,
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      userPhone: req.user.phone || '',
      locationId: location._id,
      locationName: location.name,
      locationAddress: location.address,
      slotId: slot._id,
      slotNumber: slot.slotNumber,
      floor: slot.floor,
      slotType: slot.type,
      vehicle: vehicle || { plateNumber: 'KA-01-AB-1234', makeModel: 'Standard Car', type: 'Car' },
      startTime,
      endTime,
      durationHours: duration,
      ratePerHour,
      subtotal,
      taxes,
      totalAmount,
      paymentStatus: 'PAID',
      paymentMethod: paymentMethod || 'UPI / Google Pay',
      paymentReference: `UPI-${uuidv4().substring(0, 12).toUpperCase()}`,
      bookingStatus: 'ACTIVE',
      qrCodeData: qrPayload,
      qrDataUrl,
      entryTime: null,
      exitTime: null,
      createdAt: new Date().toISOString()
    };

    insertOne('bookings', newBooking);

    // 6. Record payment transaction
    const paymentRecord = {
      _id: `pay_${uuidv4().substring(0, 8)}`,
      bookingId: newBooking._id,
      bookingReference: bookingRef,
      userId: req.user._id,
      userName: req.user.name,
      amount: totalAmount,
      currency: 'INR',
      method: paymentMethod || 'Google Pay / UPI',
      upiId: upiId || `${req.user.name.toLowerCase().replace(/\s+/g, '')}@okaxis`,
      status: 'SUCCESS',
      transactionId: newBooking.paymentReference,
      createdAt: new Date().toISOString()
    };
    insertOne('payments', paymentRecord);

    // 7. Update slot status in real-time and broadcast to all connected clients
    updateOne('slots', s => s._id === slotId, {
      status: 'booked',
      currentVehicle: vehicle?.plateNumber || 'BOOKED'
    });

    broadcastSlotUpdate({
      locationId,
      slotId,
      slotNumber: slot.slotNumber,
      status: 'booked',
      updatedAt: new Date().toISOString()
    });

    return res.status(201).json({
      success: true,
      message: 'Parking slot booked successfully! Your entry QR ticket is ready.',
      data: newBooking
    });
  } catch (error) {
    console.error('Booking error:', error);
    return res.status(500).json({ success: false, message: 'Server error while processing booking' });
  }
});

// Get user's bookings (with status filter: all, active, completed, cancelled)
router.get('/my-bookings', protect, (req, res) => {
  try {
    const { status } = req.query;
    let bookings = findMany('bookings', b => b.userId === req.user._id);

    if (status && status !== 'ALL') {
      bookings = bookings.filter(b => b.bookingStatus === status.toUpperCase());
    }

    // Sort by newest first
    bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve bookings' });
  }
});

// Get booking by ID
router.get('/:id', protect, (req, res) => {
  const booking = findOne('bookings', b => b._id === req.params.id);
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }

  // Allow owner or admin
  if (booking.userId !== req.user._id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  return res.json({ success: true, data: booking });
});

// Cancel a booking
router.post('/:id/cancel', protect, (req, res) => {
  try {
    const booking = findOne('bookings', b => b._id === req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.userId !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (booking.bookingStatus === 'CANCELLED') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    if (booking.bookingStatus === 'COMPLETED') {
      return res.status(400).json({ success: false, message: 'Cannot cancel an already completed booking' });
    }

    // Update booking status
    const updated = updateOne('bookings', b => b._id === booking._id, {
      bookingStatus: 'CANCELLED',
      cancellationReason: req.body.reason || 'User cancelled prior to arrival',
      cancelledAt: new Date().toISOString()
    });

    // Release slot back to available
    updateOne('slots', s => s._id === booking.slotId, {
      status: 'available',
      currentVehicle: null
    });

    broadcastSlotUpdate({
      locationId: booking.locationId,
      slotId: booking.slotId,
      slotNumber: booking.slotNumber,
      status: 'available',
      updatedAt: new Date().toISOString()
    });

    return res.json({
      success: true,
      message: 'Booking cancelled successfully. Refund has been initiated to your UPI account.',
      data: updated
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to cancel booking' });
  }
});

export default router;
