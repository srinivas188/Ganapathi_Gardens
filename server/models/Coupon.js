const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  discountType: { type: String, enum: ['flat', 'percentage', 'free_shipping'], default: 'flat' },
  discountValue: { type: Number, required: true },
  minOrder: { type: Number, default: 0 },
  maxDiscount: { type: Number },
  description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);
