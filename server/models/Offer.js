const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  code: { type: String, required: true, uppercase: true, trim: true },
  discountPercent: { type: Number, required: true },
  maxDiscount: { type: Number, default: 500 },
  minOrderValue: { type: Number, default: 299 },
  description: { type: String, default: '' },
  badgeText: { type: String, default: 'SPECIAL OFFER' },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.models.Offer || mongoose.model('Offer', offerSchema);
