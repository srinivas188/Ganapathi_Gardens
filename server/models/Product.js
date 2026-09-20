const mongoose = require('mongoose');

const sizeVariantSchema = new mongoose.Schema({
  size: { type: String, required: true },
  height: { type: String, default: '' },
  pot: { type: String, default: '' },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  discount: { type: Number, default: 0 },
  finalPrice: { type: Number },
  stock: { type: Number, default: 10 },
  sku: { type: String }
}, { _id: false });

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true, trim: true },
  botanicalName: { type: String, default: '' },
  category: { type: String, required: true },
  plantType: { 
    type: String, 
    default: 'Indoor',
    enum: ['Indoor', 'Outdoor', 'Flowering', 'Fruit', 'Air-Purifying', 'Gardening Products', 'Medicinal', 'Bonsai', 'Succulent', 'All']
  },
  description: { type: String, default: '' },
  mainImage: { type: String, required: true },
  images: [{ type: String }],
  size: { type: String, default: 'Medium' },
  height: { type: String, default: '1.5 - 2 Feet' },
  potSize: { type: String, default: '8 Inch Nursery Pot' },
  originalPrice: { type: Number, required: true },
  price: { type: Number, required: true }, // selling price
  discount: { type: Number, default: 0 }, // percentage discount e.g. 15
  finalPrice: { type: Number, required: true },
  stock: { type: Number, default: 20 },
  availability: { type: String, default: 'In Stock', enum: ['In Stock', 'Out of Stock', 'Pre-Order'] },
  sunlight: { type: String, default: 'Bright Indirect Sunlight' },
  waterRequirement: { type: String, default: 'Water when top 1-2 inches dry' },
  careInstructions: { type: String, default: 'Fertilize once a month with organic vermicompost. Keep leaves dusted.' },
  rating: { type: Number, default: 4.8 },
  reviewCount: { type: Number, default: 24 },
  badge: { type: String, default: '' },
  isFeatured: { type: Boolean, default: false },
  isPopular: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  sizes: [sizeVariantSchema],
  tags: [{ type: String }]
}, { timestamps: true });

// Pre-save hook to ensure finalPrice calculation
productSchema.pre('save', function () {
  if (this.originalPrice && this.discount) {
    this.finalPrice = Math.round(this.originalPrice * (1 - this.discount / 100));
    this.price = this.finalPrice;
  } else if (!this.finalPrice) {
    this.finalPrice = this.price || this.originalPrice;
  }
  if (!this.mainImage && this.images && this.images.length > 0) {
    this.mainImage = this.images[0];
  }
  if (this.mainImage && (!this.images || this.images.length === 0)) {
    this.images = [this.mainImage];
  }
});

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);
