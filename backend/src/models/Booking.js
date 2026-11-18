import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  bookingReference: { type: String, required: true, unique: true, index: true },
  userId: { type: String, required: true, index: true },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  userPhone: { type: String, default: '' },
  locationId: { type: String, required: true, index: true },
  locationName: { type: String, required: true },
  locationAddress: { type: String, default: '' },
  slotId: { type: String, required: true, index: true },
  slotNumber: { type: String, required: true },
  floor: { type: String, default: 'G' },
  slotType: { type: String, default: 'FOUR_WHEELER' },
  vehicle: {
    number: { type: String, required: true },
    type: { type: String, default: 'FOUR_WHEELER' },
    model: { type: String, default: '' },
  },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  durationHours: { type: Number, default: 2 },
  ratePerHour: { type: Number, default: 50 },
  subtotal: { type: Number, default: 100 },
  taxes: { type: Number, default: 18 },
  totalAmount: { type: Number, required: true },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
    default: 'PAID',
  },
  paymentMethod: { type: String, default: 'UPI' },
  paymentReference: { type: String, default: '' },
  bookingStatus: {
    type: String,
    enum: ['CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED'],
    default: 'CONFIRMED',
    index: true,
  },
  qrCodeData: { type: String, default: '' },
  qrDataUrl: { type: String, default: '' },
  entryGatePass: { type: String, default: '' },
  entryTime: { type: String, default: null },
  exitTime: { type: String, default: null },
}, { timestamps: true, collection: 'bookings' });

export default mongoose.model('Booking', bookingSchema);
