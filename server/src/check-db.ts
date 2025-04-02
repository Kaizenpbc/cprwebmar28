import { pool } from './db';

async function checkDatabase() {
    try {
        // Check if knex_migrations table exists
        const migrationsResult = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'knex_migrations'
            );
        `);
        console.log('knex_migrations table exists:', migrationsResult.rows[0].exists);

        // Check if users table exists
        const usersResult = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'users'
            );
        `);
        console.log('users table exists:', usersResult.rows[0].exists);

        // List all tables
        const tablesResult = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public';
        `);
        console.log('\nAll tables in database:');
        tablesResult.rows.forEach(row => console.log(row.table_name));

        process.exit(0);
    } catch (error) {
        console.error('Error checking database:', error);
        process.exit(1);
    }
}

checkDatabase(); 