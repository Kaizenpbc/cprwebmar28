import { Pool } from 'pg';
import knex from 'knex';
import knexConfig from '../../knexfile';

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'cpr_web',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
});

const db = knex(knexConfig.development);

export { pool, db }; 