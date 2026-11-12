import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Location' }],
}, { timestamps: true });

// Helper method to compare password
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

export default mongoose.model('User', userSchema);
