import mongoose from 'mongoose';

const parkingLotSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  tagline: { type: String, default: '' },
  address: { type: String, required: true },
  city: { type: String, default: 'Bangalore' },
  coordinates: {
    lat: { type: Number, default: 12.9716 },
    lng: { type: Number, default: 77.5946 },
  },
  distance: { type: String, default: '1.2 km' },
  pricing: {
    baseHourly: { type: Number, default: 50 },
    carHourly: { type: Number, default: 50 },
    bikeHourly: { type: Number, default: 20 },
    evHourly: { type: Number, default: 70 },
    heavyHourly: { type: Number, default: 100 },
  },
  totalSlots: { type: Number, default: 0 },
  availableSlots: { type: Number, default: 0 },
  rating: { type: Number, default: 4.8 },
  reviewCount: { type: Number, default: 120 },
  operatingHours: { type: String, default: '24/7' },
  images: [{ type: String }],
  amenities: [{ type: String }],
  floors: [{ type: String }],
}, { timestamps: true, collection: 'parkinglots' });

export default mongoose.model('ParkingLot', parkingLotSchema);
