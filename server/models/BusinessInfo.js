const mongoose = require('mongoose');

const deliveryTierSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  charge: { type: Number, required: true },
  description: { type: String, default: '' },
  estimatedDelivery: { type: String, default: 'Same Day / Next Day' },
  active: { type: Boolean, default: true }
}, { _id: false });

const businessInfoSchema = new mongoose.Schema({
  businessName: { type: String, default: 'Ganapathi Gardens' },
  businessType: { type: String, default: 'Plant Nursery & Gardening Store' },
  tagline: { type: String, default: 'Bring Nature Home with Ganapathi Gardens' },
  subtitle: { type: String, default: 'Healthy plants, beautiful gardens and everything you need to grow a greener home.' },
  address: { type: String, default: 'Cheediga, Kakinada, Andhra Pradesh, India' },
  contactNumber: { type: String, default: '090008 35323' },
  email: { type: String, default: 'ganapathigardens@gmail.com' },
  whatsapp: { type: String, default: '090008 35323' },
  website: { type: String, default: 'ganapathigardens.com' },
  openingHours: { type: String, default: 'Monday - Sunday: 7:00 AM - 7:30 PM' },
  mapLink: { type: String, default: 'https://maps.app.goo.gl/apLx3Us3cWC1PKz87' },
  mapEmbedUrl: { type: String, default: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3815.123!2d82.234!3d16.989!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTbCsDU5JzIwLjQiTiA4MsKwMTQnMDQuOCJF!5e0!3m2!1sen!2sin!4v1650000000000' },
  description: { 
    type: String, 
    default: 'Ganapathi Gardens is a premier plant nursery located in Cheediga, Kakinada. We specialize in healthy indoor plants, exotic flowering shrubs, certified fruit saplings, air-purifying varieties, organic potting mix, and expert garden consultation to help you create lush green sanctuaries.' 
  },
  deliveryAreas: [deliveryTierSchema]
}, { timestamps: true });

module.exports = mongoose.models.BusinessInfo || mongoose.model('BusinessInfo', businessInfoSchema);
