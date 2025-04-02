import { Pool } from 'pg';
import knex from 'knex';
import knexConfig from '../../knexfile';
import logger from '../utils/logger';

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'cpr_db_dev',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
});

// Add error handler for the pool
pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Test the connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    logger.error('Database connection error:', err);
  } else {
    logger.info('Database connected successfully at:', res.rows[0].now);
  }
});

const db = knex(knexConfig.development);

// Test Knex connection
db.raw('SELECT 1')
  .then(() => {
    logger.info('Knex connection successful');
  })
  .catch((err) => {
    logger.error('Knex connection error:', err);
  });

export { pool, db }; 