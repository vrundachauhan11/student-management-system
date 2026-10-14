require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const studentRoutes = require('./routes/studentRoutes');
const healthRoutes = require('./routes/healthRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Parse Allowed Origins from CLIENT_URL environment variable
const getAllowedOrigins = () => {
  const configured = process.env.CLIENT_URL;
  if (!configured || configured.trim() === '*') {
    return '*';
  }
  return configured.split(',').map((url) => url.trim());
};

const allowedOrigins = getAllowedOrigins();

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. curl, postman, render health checks) or when origin is undefined
    if (!origin) return callback(null, true);

    if (allowedOrigins === '*') {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin) || origin.endsWith('.netlify.app')) {
      return callback(null, true);
    }

    // Always allow localhost in non-production
    if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
      return callback(null, true);
    }

    callback(new Error(`CORS Error: Origin '${origin}' is not authorized.`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Student Information Management System API',
    version: '1.0.0',
    documentation: {
      health: '/api/health',
      students: '/api/students',
    },
  });
});

// Mount Routes
app.use('/api/health', healthRoutes);
app.use('/api/students', studentRoutes);

// Catch-all 404 route for undefined endpoints
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handling
app.use(errorHandler);

// Initialize Database & Server
const PORT = process.env.PORT || 5000;

let server;

const startServer = async () => {
  // Attempt DB connection (does not crash server if MONGODB_URI is not set yet)
  await connectDB();

  server = app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 Student API Server running on port ${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🎓 Students API: http://localhost:${PORT}/api/students`);
    console.log(`🔒 Allowed CORS: ${Array.isArray(allowedOrigins) ? allowedOrigins.join(', ') : allowedOrigins}`);
    console.log(`====================================================`);
  });
};

// Graceful shutdown handling
const shutdown = () => {
  console.log('\nReceived shutdown signal. Closing HTTP server cleanly...');
  if (server) {
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
