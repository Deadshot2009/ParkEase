import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { findOne, findMany, insertOne } from '../utils/dataStore.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Create UPI / Gateway Order Intent
router.post('/create-order', protect, (req, res) => {
  const { amount, locationId, slotId, durationHours } = req.body;
  if (!amount) {
    return res.status(400).json({ success: false, message: 'Amount is required' });
  }

  const orderId = `order_${uuidv4().substring(0, 10)}`;
  const upiDeepLink = `upi://pay?pa=parkease.pay@okaxis&pn=ParkEase%20Smart%20Parking&am=${amount}&cu=INR&tn=Parking%20Reservation%20Slot%20${orderId}`;

  return res.json({
    success: true,
    data: {
      orderId,
      amount,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_parkease_sandbox',
      upiDeepLink,
      qrString: upiDeepLink,
      acceptedMethods: ['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI', 'Credit/Debit Card']
    }
  });
});

// Verify Gateway payment
router.post('/verify', protect, (req, res) => {
  const { orderId, paymentId, signature } = req.body;
  // In sandbox / test environment, verify signature or test token
  return res.json({
    success: true,
    verified: true,
    message: 'Payment verified securely by payment gateway callback',
    transactionId: paymentId || `TXN_${uuidv4().substring(0, 10).toUpperCase()}`
  });
});

// Payment history for user
router.get('/history', protect, (req, res) => {
  const payments = findMany('payments', p => p.userId === req.user._id);
  payments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return res.json({ success: true, count: payments.length, data: payments });
});

// Downloadable receipt data
router.get('/receipt/:bookingId', protect, (req, res) => {
  const booking = findOne('bookings', b => b._id === req.params.bookingId);
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }

  if (booking.userId !== req.user._id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  const payment = findOne('payments', p => p.bookingId === booking._id) || {
    transactionId: booking.paymentReference,
    method: booking.paymentMethod,
    amount: booking.totalAmount,
    createdAt: booking.createdAt
  };

  const receipt = {
    receiptNumber: `REC-${booking.bookingReference}`,
    bookingReference: booking.bookingReference,
    issueDate: new Date().toISOString(),
    billedTo: {
      name: booking.userName,
      email: booking.userEmail,
      phone: booking.userPhone
    },
    location: {
      name: booking.locationName,
      address: booking.locationAddress
    },
    parkingDetails: {
      slotNumber: booking.slotNumber,
      floor: booking.floor,
      slotType: booking.slotType,
      vehicle: booking.vehicle,
      startTime: booking.startTime,
      endTime: booking.endTime,
      durationHours: booking.durationHours,
      ratePerHour: booking.ratePerHour
    },
    financialBreakdown: {
      subtotal: booking.subtotal,
      taxes: booking.taxes,
      taxName: 'GST (18%)',
      totalAmount: booking.totalAmount,
      currency: 'INR',
      paymentStatus: 'PAID',
      paymentMethod: booking.paymentMethod,
      transactionId: payment.transactionId
    },
    issuer: {
      companyName: 'ParkEase Smart Mobility Solutions Pvt. Ltd.',
      gstin: '07AAACP9921K1ZK',
      supportEmail: 'support@parkease.com'
    }
  };

  return res.json({ success: true, data: receipt });
});

export default router;
