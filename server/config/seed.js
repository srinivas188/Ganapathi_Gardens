const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const Product = require('../models/Product');
const Order = require('../models/Order');
const BusinessInfo = require('../models/BusinessInfo');
const Category = require('../models/Category');
const Offer = require('../models/Offer');
const Admin = require('../models/Admin');
const User = require('../models/User');

const DB_FILE = path.join(__dirname, '..', 'data', 'db.json');

async function seedDatabase() {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const data = JSON.parse(raw);

    // 1. Admin account
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      console.log('🔐 Seeding default Ganapathi Gardens Admin account...');
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@ganapathigardens.com';
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await Admin.create({
        name: 'Ganapathi Gardens Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin'
      });
      console.log(`✅ Admin initialized (${adminEmail})`);
    }

    // 2. Business Information
    const infoCount = await BusinessInfo.countDocuments();
    if (infoCount === 0 && data.businessInfo) {
      console.log('📍 Seeding Ganapathi Gardens Business Information...');
      await BusinessInfo.create({
        ...data.businessInfo,
        deliveryAreas: data.deliveryAreas || []
      });
      console.log('✅ Business Information & Delivery Tiers seeded.');
    }

    // 3. Products
    const prodCount = await Product.countDocuments();
    if (prodCount === 0 && data.products && data.products.length > 0) {
      console.log(`🌱 Seeding ${data.products.length} Ganapathi Gardens plants to MongoDB...`);
      await Product.insertMany(data.products);
      console.log(`✅ Products seeded successfully.`);
    }

    // 4. Categories
    const catCount = await Category.countDocuments();
    if (catCount === 0 && data.categories && data.categories.length > 0) {
      console.log(`📂 Seeding ${data.categories.length} categories to MongoDB...`);
      await Category.insertMany(data.categories);
      console.log(`✅ Categories seeded successfully.`);
    }

    // 5. Offers
    const offerCount = await Offer.countDocuments();
    if (offerCount === 0 && data.offers && data.offers.length > 0) {
      console.log(`🏷️ Seeding ${data.offers.length} offers to MongoDB...`);
      await Offer.insertMany(data.offers);
      console.log(`✅ Offers seeded successfully.`);
    }

    // 6. Orders
    const orderCount = await Order.countDocuments();
    if (orderCount === 0 && data.orders && data.orders.length > 0) {
      console.log(`📦 Seeding initial nursery orders to MongoDB...`);
      await Order.insertMany(data.orders);
      console.log(`✅ Orders seeded successfully.`);
    }

    console.log(`🌿 Ganapathi Gardens Nursery database is fully synchronized.`);
  } catch (err) {
    console.error(`⚠️ Error during MongoDB seeding:`, err.message);
  }
}

module.exports = { seedDatabase };
