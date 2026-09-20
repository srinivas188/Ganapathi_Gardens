const mongoose = require('mongoose');

const orderProductSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  size: { type: String, default: 'Medium' },
  height: { type: String, default: '' },
  potSize: { type: String, default: '' },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  discount: { type: Number, default: 0 },
  finalPrice: { type: Number },
  quantity: { type: Number, default: 1 },
  image: { type: String, required: true }
}, { _id: false });

const orderTimelineSchema = new mongoose.Schema({
  status: { type: String, required: true },
  time: { type: Date, default: Date.now },
  note: { type: String, default: '' },
  completed: { type: Boolean, default: true }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true }, // e.g. GG1001
  customerId: { type: String, default: 'guest' },
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, default: '' },
  address: { type: String, required: true },
  area: { type: String, default: 'Kakinada City' },
  city: { type: String, default: 'Kakinada' },
  state: { type: String, default: 'Andhra Pradesh' },
  pincode: { type: String, required: true },
  products: [orderProductSchema],
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  couponCode: { type: String, default: '' },
  transportCharge: { type: Number, default: 50 }, // Configurable delivery charge
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    default: 'Order Placed',
    enum: ['Order Placed', 'Confirmed', 'Processing', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled']
  },
  cancellationReason: { type: String, default: '' },
  cancellationDate: { type: Date },
  paymentMethod: { type: String, default: 'Cash on Delivery' },
  paymentStatus: { type: String, default: 'Pending' },
  transactionId: { type: String, default: '' },
  timeline: [orderTimelineSchema]
}, { timestamps: true });

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);
