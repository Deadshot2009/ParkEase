import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { findOne, insertOne, updateOne } from '../utils/dataStore.js';
import { broadcastSlotUpdate } from '../socket/socketHandler.js';

const router = express.Router();

// Verify QR code scanned at parking entrance/exit gate
router.post('/verify-qr', (req, res) => {
  try {
    const { qrData, gateId, action } = req.body; // action: 'ENTRY' or 'EXIT'
    if (!qrData) {
      return res.status(400).json({ success: false, message: 'QR payload is required' });
    }

    let parsed;
    try {
      parsed = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
    } catch (e) {
      // If it's a plain booking reference string
      parsed = { bookingRef: qrData };
    }

    const bookingRef = parsed.bookingRef || parsed.bookingReference;
    if (!bookingRef) {
      return res.status(400).json({ success: false, message: 'Invalid QR code format: missing booking reference' });
    }

    const booking = findOne('bookings', b => b.bookingReference === bookingRef);
    if (!booking) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: `Booking reference ${bookingRef} not found in system`
      });
    }

    if (booking.bookingStatus === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'This booking has been CANCELLED. Access denied at barrier.'
      });
    }

    const gate = gateId || 'Gate Boom Barrier #1';
    const now = new Date();

    if (action === 'EXIT' || (booking.entryTime && !booking.exitTime)) {
      // Mark as exited / completed
      const updated = updateOne('bookings', b => b._id === booking._id, {
        exitTime: now.toISOString(),
        bookingStatus: 'COMPLETED'
      });

      // Free slot
      updateOne('slots', s => s._id === booking.slotId, {
        status: 'available',
        currentVehicle: null
      });

      broadcastSlotUpdate({
        locationId: booking.locationId,
        slotId: booking.slotId,
        slotNumber: booking.slotNumber,
        status: 'available',
        updatedAt: now.toISOString()
      });

      const log = {
        _id: `log_${uuidv4().substring(0, 8)}`,
        bookingId: booking._id,
        bookingReference: booking.bookingReference,
        slotNumber: booking.slotNumber,
        plateNumber: booking.vehicle?.plateNumber,
        action: 'EXIT',
        scannedAt: now.toISOString(),
        verifiedBy: gate,
        status: 'BARRIER_OPENED'
      };
      insertOne('entryLogs', log);

      return res.json({
        success: true,
        valid: true,
        action: 'EXIT',
        message: `Vehicle ${booking.vehicle?.plateNumber} exited. Barrier opened. Have a safe journey!`,
        data: {
          booking: updated,
          log
        }
      });
    } else {
      // Entry
      const updated = updateOne('bookings', b => b._id === booking._id, {
        entryTime: now.toISOString(),
        bookingStatus: 'ACTIVE'
      });

      const log = {
        _id: `log_${uuidv4().substring(0, 8)}`,
        bookingId: booking._id,
        bookingReference: booking.bookingReference,
        slotNumber: booking.slotNumber,
        plateNumber: booking.vehicle?.plateNumber,
        action: 'ENTRY',
        scannedAt: now.toISOString(),
        verifiedBy: gate,
        status: 'BARRIER_OPENED'
      };
      insertOne('entryLogs', log);

      return res.json({
        success: true,
        valid: true,
        action: 'ENTRY',
        message: `Welcome! Slot ${booking.slotNumber} reserved for ${booking.userName}. Barrier opened.`,
        data: {
          booking: updated,
          log
        }
      });
    }
  } catch (error) {
    console.error('QR verification error:', error);
    return res.status(500).json({ success: false, message: 'Server error during QR scanning verification' });
  }
});

// Get recent gate scan logs
router.get('/logs', (req, res) => {
  const { limit = 20 } = req.query;
  const logs = findMany('entryLogs');
  logs.sort((a, b) => new Date(b.scannedAt) - new Date(a.scannedAt));
  return res.json({ success: true, data: logs.slice(0, parseInt(limit)) });
});

export default router;
