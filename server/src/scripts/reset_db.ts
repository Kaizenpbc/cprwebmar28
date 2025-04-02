import { Pool } from 'pg';

const mainPool = new Pool({
  user: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: 'postgres', // Connect to default postgres database
  password: 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
});

async function resetDatabase() {
  const client = await mainPool.connect();
  try {
    // Drop database if it exists
    await client.query(`
      DROP DATABASE IF EXISTS cpr_web;
    `);

    // Create database
    await client.query(`
      CREATE DATABASE cpr_web;
    `);

    // Create user if it doesn't exist
    await client.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'cpr_web_user') THEN
          CREATE USER cpr_web_user WITH PASSWORD 'cpr_web_password';
        END IF;
      END
      $$;
    `);

    // Grant privileges
    await client.query(`
      GRANT ALL PRIVILEGES ON DATABASE cpr_web TO cpr_web_user;
    `);

    console.log('Database reset successfully');
  } catch (error) {
    console.error('Error resetting database:', error);
  } finally {
    client.release();
    await mainPool.end();
  }
}

resetDatabase(); 