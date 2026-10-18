// config/db.js
// Connects to MongoDB. If connection fails the app still works
// using in-memory demo data (no crash).

const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/insider_threat_db';
  try {
    await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 3000 });
    isConnected = true;
    console.log('[DB] MongoDB connected successfully.');
  } catch (err) {
    isConnected = false;
    console.warn('[DB] MongoDB not reachable — running with demo data fallback. Error:', err.message);
  }
};

const getIsConnected = () => isConnected;

module.exports = { connectDB, getIsConnected };
