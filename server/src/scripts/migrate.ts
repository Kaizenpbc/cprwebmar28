import { db } from '../config/db';
import logger from '../utils/logger';

async function migrate() {
  try {
    logger.info('Starting database migration...');

    // Get current migration status
    const currentMigrations = await db('knex_migrations')
      .select('name')
      .orderBy('id', 'asc');
    
    logger.info('Current migrations:', currentMigrations.map(m => m.name));

    // Run pending migrations
    await db.migrate.latest();
    
    logger.info('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate(); 