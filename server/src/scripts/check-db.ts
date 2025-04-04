import { db } from '../config/db';

async function checkDatabase() {
    try {
        console.log('Checking database connection...');
        const result = await db.raw('SELECT 1');
        console.log('Database connection successful:', result);
        
        console.log('\nChecking if tables exist...');
        const tables = await db.raw(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('Existing tables:', tables.rows.map((r: { table_name: string }) => r.table_name));
        
        process.exit(0);
    } catch (error) {
        console.error('Database check failed:', error);
        process.exit(1);
    }
}

checkDatabase(); 