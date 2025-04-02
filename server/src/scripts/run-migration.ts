import knex from '../config/db';
import { up as initialSchemaUp } from '../migrations/001_initial_schema';

async function runMigration() {
    try {
        await initialSchemaUp(knex);
        console.log('\nMigration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('\nMigration failed:', error);
        process.exit(1);
    }
}

runMigration(); 