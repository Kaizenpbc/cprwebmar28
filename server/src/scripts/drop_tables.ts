import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.DB_USER || 'cpr_web_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'cpr_web',
  password: process.env.DB_PASSWORD || 'cpr_web_password',
  port: parseInt(process.env.DB_PORT || '5432'),
});

async function dropTables() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Drop all tables
    await client.query(`
      DROP TABLE IF EXISTS attendance CASCADE;
      DROP TABLE IF EXISTS enrollments CASCADE;
      DROP TABLE IF EXISTS students CASCADE;
      DROP TABLE IF EXISTS course_instances CASCADE;
      DROP TABLE IF EXISTS course_types CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS organizations CASCADE;
      DROP TYPE IF EXISTS user_role CASCADE;
    `);
    
    await client.query('COMMIT');
    console.log('All tables dropped successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error dropping tables:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

dropTables(); 