import { db } from '../config/db';
import logger from '../utils/logger';

const checkConnection = async () => {
  try {
    const result = await db.raw('SELECT NOW()');
    logger.info('Database connection successful');
    logger.info('Current database time:', result.rows[0].now);
    process.exit(0);
  } catch (error) {
    logger.error('Database connection failed:', error);
    process.exit(1);
  }
};

// Run the connection check
checkConnection(); 