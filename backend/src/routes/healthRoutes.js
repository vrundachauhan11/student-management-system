const express = require('express');
const router = express.Router();
const { getDbStatus } = require('../config/db');

/**
 * @route   GET /api/health
 * @desc    System health check and diagnostic endpoint (zero secrets exposed)
 * @access  Public
 */
router.get('/', (req, res) => {
  const dbStatus = getDbStatus();
  const isHealthy = dbStatus.isConnected;

  const response = {
    status: isHealthy ? 'healthy' : 'degraded',
    service: 'Student Information Management System API',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbStatus.state,
      connected: dbStatus.isConnected,
      databaseName: dbStatus.databaseName,
    },
  };

  // Return 200 even if degraded so monitors can inspect the payload, or 503 if critical
  res.status(200).json(response);
});

module.exports = router;
