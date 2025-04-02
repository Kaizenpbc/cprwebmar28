import { pool } from './db';

async function resetDatabase() {
    try {
        // Drop all tables and types
        await pool.query('DROP SCHEMA public CASCADE');
        await pool.query('CREATE SCHEMA public');
        
        console.log('Database reset successful');
        process.exit(0);
    } catch (error) {
        console.error('Error resetting database:', error);
        process.exit(1);
    }
}

resetDatabase(); 