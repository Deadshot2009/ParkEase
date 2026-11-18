import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, index: true },
  bookingReference: { type: String, required: true },
  userId: { type: String, required: true, index: true },
  userName: { type: String, default: '' },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  method: {
    type: String,
    enum: ['GPAY', 'PHONEPE', 'PAYTM', 'UPI', 'CARD', 'NETBANKING'],
    default: 'UPI',
  },
  transactionId: { type: String, required: true, unique: true, index: true },
  paymentDetails: { type: mongoose.Schema.Types.Mixed, default: {} },
  status: {
    type: String,
    enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'],
    default: 'SUCCESS',
  },
}, { timestamps: true, collection: 'payments' });

export default mongoose.model('Payment', paymentSchema);
