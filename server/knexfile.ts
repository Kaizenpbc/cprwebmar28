import dotenv from 'dotenv';
import { Knex } from 'knex';
import path from 'path';

// Load environment variables
dotenv.config();

const defaultConfig = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'gtacpr',
    database: process.env.DB_NAME || 'cpr_db_dev',
    port: parseInt(process.env.DB_PORT || '5432'),
  },
  pool: {
    min: 2,
    max: 10,
    // Add idle timeout to prevent connection leaks
    idleTimeoutMillis: 30000
  },
  migrations: {
    directory: './src/migrations',
    extension: 'ts'
  },
  seeds: {
    directory: './src/seeds',
    extension: 'ts'
  }
};

const config: { [key: string]: Knex.Config } = {
  development: {
    ...defaultConfig,
  },
  test: {
    ...defaultConfig,
    connection: {
      ...defaultConfig.connection,
      database: process.env.TEST_DB_NAME || 'cpr_db_test',
    },
  },
  production: {
    ...defaultConfig,
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT || '5432'),
    },
    migrations: {
      directory: './src/migrations',
      extension: 'ts'
    },
    seeds: {
      directory: path.resolve(__dirname, 'dist/seeds'),
      extension: 'js'
    }
  }
};

export default config; 