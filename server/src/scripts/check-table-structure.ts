import { db } from '../config/db';
import logger from '../utils/logger';

async function checkTableStructure() {
  try {
    logger.info('Checking course_instances table structure...');
    
    const result = await db.raw(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'course_instances'
      ORDER BY ordinal_position;
    `);

    logger.info('Table structure:', result.rows);

    // Also check if there are any records
    const records = await db('course_instances').select('*');
    logger.info('Number of records:', records.length);
    if (records.length > 0) {
      logger.info('Sample record:', records[0]);
    }

  } catch (error) {
    logger.error('Error checking table structure:', error);
  }
}

checkTableStructure(); 