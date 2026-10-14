const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn('⚠️  MONGODB_URI environment variable is not defined.');
    console.warn('⚠️  Database features will be disabled until MONGODB_URI is provided.');
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      dbName: 'studentDB',
      serverSelectionTimeoutMS: 5000, // Fail fast if Atlas is unreachable
    });

    isConnected = true;
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host} (Database: studentDB)`);
    return true;
  } catch (error) {
    isConnected = false;
    console.error(`❌ MongoDB Atlas Connection Error: ${error.message}`);
    return false;
  }
};

mongoose.connection.on('connected', () => {
  isConnected = true;
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('⚠️  MongoDB connection lost / disconnected.');
});

mongoose.connection.on('error', (err) => {
  isConnected = false;
  console.error('❌ MongoDB runtime error:', err.message);
});

const getDbStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  const stateCode = mongoose.connection.readyState;
  return {
    state: states[stateCode] || 'unknown',
    isConnected: stateCode === 1,
    databaseName: mongoose.connection.name || 'studentDB',
  };
};

module.exports = { connectDB, getDbStatus };
