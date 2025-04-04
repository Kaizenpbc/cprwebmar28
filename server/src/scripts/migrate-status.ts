import { db } from '../config/db';
import logger from '../utils/logger';

async function checkStatus() {
  try {
    logger.info('Checking migration status...');

    // Get all migrations
    const migrations = await db('knex_migrations')
      .select('*')
      .orderBy('id', 'asc');
    
    if (migrations.length === 0) {
      logger.info('No migrations have been run yet');
    } else {
      logger.info('Applied migrations:');
      migrations.forEach(migration => {
        logger.info(`- ${migration.name} (Batch: ${migration.batch}, Time: ${migration.migration_time})`);
      });
    }

    // Check if there are any pending migrations
    const pendingMigrations = await db.migrate.status();
    if (pendingMigrations === 0) {
      logger.info('All migrations are up to date');
    } else {
      logger.info(`There are ${pendingMigrations} pending migrations`);
    }

    process.exit(0);
  } catch (error) {
    logger.error('Error checking migration status:', error);
    process.exit(1);
  }
}

checkStatus(); 