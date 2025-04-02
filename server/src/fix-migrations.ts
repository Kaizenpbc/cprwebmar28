import { pool } from './db';

async function fixMigrations() {
    try {
        // First, clear existing migration records
        await pool.query('DELETE FROM knex_migrations');
        
        // Insert migration records
        await pool.query(`
            INSERT INTO knex_migrations (name, batch, migration_time)
            VALUES 
                ('001_initial_schema.ts', 1, CURRENT_TIMESTAMP),
                ('reset_migrations.ts', 1, CURRENT_TIMESTAMP);
        `);
        console.log('Migration records inserted successfully');

        process.exit(0);
    } catch (error) {
        console.error('Error fixing migrations:', error);
        process.exit(1);
    }
}

fixMigrations(); 