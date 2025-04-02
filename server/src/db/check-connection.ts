import { db } from '../db';

const checkConnection = async () => {
  try {
    const result = await db.query('SELECT NOW()');
    console.log('Database connection successful');
    console.log('Current database time:', result.rows[0].now);
    process.exit(0);
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

// Run the connection check
checkConnection(); 