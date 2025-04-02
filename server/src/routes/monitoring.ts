import express from 'express';
import { db } from '../config/db';
import { ProcessMonitor } from '../utils/processMonitor';
import logger from '../utils/logger';

const router = express.Router();
const processMonitor = ProcessMonitor.getInstance();

// Get system metrics
router.get('/metrics', async (_req, res) => {
  try {
    const metrics = await processMonitor.collectMetrics();
    res.json(metrics);
  } catch (error) {
    logger.error('Error collecting metrics:', error);
    res.status(500).json({ error: 'Failed to collect metrics' });
  }
});

// Get database status
router.get('/database', async (_req, res) => {
  try {
    await db.raw('SELECT 1');
    res.json({ status: 'connected' });
  } catch (error) {
    logger.error('Database connection check failed:', error);
    res.status(500).json({ status: 'disconnected', error: 'Database connection failed' });
  }
});

// Get application status
router.get('/status', async (_req, res) => {
  try {
    const metrics = await processMonitor.collectMetrics();
    await db.raw('SELECT 1');
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      metrics,
      database: 'connected'
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

export default router; 