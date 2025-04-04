import { db } from '../config/db';
import logger from '../utils/logger';

async function rollback() {
  try {
    logger.info('Starting migration rollback...');

    // Get current migration status
    const currentMigrations = await db('knex_migrations')
      .select('name')
      .orderBy('id', 'desc');
    
    logger.info('Current migrations:', currentMigrations.map(m => m.name));

    // Rollback the last batch of migrations
    await db.migrate.rollback();
    
    logger.info('Rollback completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Rollback failed:', error);
    process.exit(1);
  }
}

rollback(); 