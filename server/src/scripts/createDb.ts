import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function createDatabase() {
    const client = new Client({
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        database: 'postgres' // Connect to default database first
    });

    try {
        await client.connect();
        
        // Force close all connections to the database
        await client.query(`
            SELECT pg_terminate_backend(pg_stat_activity.pid)
            FROM pg_stat_activity
            WHERE pg_stat_activity.datname = 'educational_system'
            AND pid <> pg_backend_pid();
        `);
        
        // Drop database if exists
        await client.query(`
            DROP DATABASE IF EXISTS educational_system;
        `);

        // Create database
        await client.query(`
            CREATE DATABASE educational_system;
        `);

        console.log('Database created successfully');
    } catch (error) {
        console.error('Error creating database:', error);
    } finally {
        await client.end();
    }
}

createDatabase(); 