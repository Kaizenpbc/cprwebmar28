import { db } from '../config/db';
import dotenv from 'dotenv';

// Load environment variables from .env.test if it exists, otherwise from .env
dotenv.config({ path: '.env.test' });

// Global setup
beforeAll(async () => {
  // Ensure database connection
  await db.raw('SELECT 1');
});

// Global teardown
afterAll(async () => {
  // Close database connection
  await db.destroy();
}); 