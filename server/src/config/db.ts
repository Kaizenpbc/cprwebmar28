import knex from 'knex';
import knexConfig from '../../knexfile';
import logger from '../utils/logger';

// Create a single Knex instance
const db = knex(knexConfig[process.env.NODE_ENV || 'development']);

// Add error handler for the connection
db.on('error', (err) => {
  logger.error('Unexpected error on database connection', err);
  process.exit(-1);
});

// Test the connection
db.raw('SELECT 1')
  .then(() => {
    logger.info('Database connected successfully');
  })
  .catch((err) => {
    logger.error('Database connection error:', err);
    process.exit(-1);
  });

export { db }; 