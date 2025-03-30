import dotenv from 'dotenv';
import { Knex } from 'knex';
import path from 'path';

dotenv.config();

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'educational_system',
      port: Number(process.env.DB_PORT) || 5432
    },
    migrations: {
      directory: path.join(__dirname, 'src/migrations'),
      extension: 'ts'
    },
    seeds: {
      directory: path.join(__dirname, 'src/seeds'),
      extension: 'ts'
    }
  },
  production: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: Number(process.env.DB_PORT) || 5432,
      ssl: { rejectUnauthorized: false }
    },
    migrations: {
      directory: path.join(__dirname, 'dist/migrations'),
      extension: 'js'
    },
    seeds: {
      directory: path.join(__dirname, 'dist/seeds'),
      extension: 'js'
    }
  }
};

export default config; 