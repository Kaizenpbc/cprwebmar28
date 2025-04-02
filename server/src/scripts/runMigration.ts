import { pool } from '../db';
import fs from 'fs';
import path from 'path';

async function runMigration() {
    try {
        const migrationPath = path.join(__dirname, '../migrations/20240401_fix_schema_issues.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        await pool.query(migrationSQL);
        console.log('Migration completed successfully');
    } catch (error) {
        console.error('Error running migration:', error);
    } finally {
        await pool.end();
    }
}

runMigration(); 