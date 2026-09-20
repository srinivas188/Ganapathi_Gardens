const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  password: { type: String, required: true },
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: 'Andhra Pradesh' },
  pincode: { type: String, default: '' },
  role: { type: String, default: 'customer' }
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
