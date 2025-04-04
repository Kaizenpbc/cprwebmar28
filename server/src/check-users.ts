import { pool } from './config/db';

async function checkUsers() {
    try {
        const result = await pool.query('SELECT * FROM users');
        console.log('Users in database:', result.rows);
        process.exit(0);
    } catch (error) {
        console.error('Error checking users:', error);
        process.exit(1);
    }
}

checkUsers(); 