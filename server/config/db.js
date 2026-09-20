const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load .env explicitly from server directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/Nursery_Plant';

let isConnected = false;

async function connectDB() {
  if (isConnected) {
    return;
  }

  try {
    const maskedUri = MONGODB_URI.replace(/:([^:@]+)@/, ':****@');
    console.log(`⏳ Connecting to MongoDB at: ${maskedUri}...`);
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    isConnected = true;
    console.log(`🍃 MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.warn(`⚠️ Running with resilient fallback storage.`);
  }
}

function getIsConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}

module.exports = { connectDB, getIsConnected, mongoose };
