const mongoose = require('mongoose');

const deliveryAreaSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  area: { type: String, required: true },
  pincode: { type: String, required: true },
  distance: { type: Number, required: true },
  deliveryCharge: { type: Number, required: true },
  estimatedDays: { type: String, default: '1–2 Days' },
  status: { type: String, default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('DeliveryArea', deliveryAreaSchema);
