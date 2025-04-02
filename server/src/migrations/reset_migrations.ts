import { Knex } from 'knex';
import { pool } from '../db';

export async function up(knex: Knex): Promise<void> {
    // Drop the knex_migrations table if it exists
    await pool.query('DROP TABLE IF EXISTS knex_migrations');
    await pool.query('DROP TABLE IF EXISTS knex_migrations_lock');
}

export async function down(knex: Knex): Promise<void> {
    // Recreate the knex_migrations table
    await pool.query(`
        CREATE TABLE IF NOT EXISTS knex_migrations (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            batch INTEGER NOT NULL,
            migration_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
    `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS knex_migrations_lock (
            index SERIAL PRIMARY KEY,
            is_locked INTEGER NOT NULL DEFAULT 0
        );
    `);
} 