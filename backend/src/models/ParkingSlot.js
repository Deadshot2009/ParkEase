import mongoose from 'mongoose';

const parkingSlotSchema = new mongoose.Schema({
  locationId: { type: String, required: true, index: true },
  slotNumber: { type: String, required: true },
  floor: { type: String, default: 'G' },
  type: {
    type: String,
    enum: ['TWO_WHEELER', 'FOUR_WHEELER', 'EV', 'HEAVY'],
    default: 'FOUR_WHEELER',
  },
  status: {
    type: String,
    enum: ['AVAILABLE', 'BOOKED', 'OCCUPIED', 'RESERVED', 'MAINTENANCE', 'UNAVAILABLE'],
    default: 'AVAILABLE',
    index: true,
  },
  hourlyRate: { type: Number, default: 50 },
  features: [{ type: String }],
  isEV: { type: Boolean, default: false },
  isHandicapped: { type: Boolean, default: false },
  currentBookingId: { type: String, default: null },
  currentVehicle: { type: String, default: null },
}, { timestamps: true, collection: 'parkingslots' });

parkingSlotSchema.index({ locationId: 1, slotNumber: 1 }, { unique: true });

export default mongoose.model('ParkingSlot', parkingSlotSchema);
