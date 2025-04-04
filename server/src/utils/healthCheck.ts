import axios from 'axios';
import logger from './logger';

const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds
const SERVER_URL = process.env.API_URL || 'http://localhost:9005';

export const startHealthCheck = () => {
  logger.info('Starting health check monitoring...');
  
  const checkHealth = async () => {
    try {
      const startTime = Date.now();
      const response = await axios.get(`${SERVER_URL}/health`);
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      logger.info('Health check successful:', {
        status: response.data.status,
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString(),
        serverUptime: response.data.uptime,
        memoryUsage: response.data.memoryUsage,
        database: response.data.database
      });
    } catch (error) {
      logger.error('Health check failed:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  };
  
  // Run immediately on start
  checkHealth();
  
  // Then run at intervals
  setInterval(checkHealth, HEALTH_CHECK_INTERVAL);
}; 