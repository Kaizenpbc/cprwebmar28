import knex from '../config/db';
import path from 'path';
import { up as initialSchemaUp } from '../migrations/001_initial_schema';

async function debugMigration() {
    try {
        console.log('\n=== Starting Migration Debug ===\n');
        console.log('Current working directory:', process.cwd());
        console.log('Migrations directory:', path.join(process.cwd(), 'src', 'migrations'));

        console.log('\n1. Checking current database state...');
        const tables = await knex.raw(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('Current tables:', tables.rows.map((r: { table_name: string }) => r.table_name));

        console.log('\n2. Running initial schema migration directly...');
        try {
            // Force console to flush
            process.stdout.write('\n');
            await initialSchemaUp(knex);
            process.stdout.write('\n');
            console.log('Initial schema migration completed successfully');
        } catch (migrationError) {
            console.log('\nMigration error:', migrationError);
            throw migrationError; // Re-throw to see the full error
        }

        // Force a small delay to ensure logs are shown
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log('\n3. Verifying final state...');
        const finalTables = await knex.raw(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('Final tables:', finalTables.rows.map((r: { table_name: string }) => r.table_name));

        console.log('\n=== Migration Debug Complete ===\n');
        process.exit(0);
    } catch (error) {
        console.error('\n=== Migration Debug Failed ===\n');
        console.error('Error details:', error);
        process.exit(1);
    }
}

// Force console to flush
process.stdout.write('\n');
debugMigration(); 