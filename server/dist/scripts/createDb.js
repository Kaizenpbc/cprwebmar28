"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function createDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        const client = new pg_1.Client({
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD,
            host: process.env.DB_HOST || 'localhost',
            port: Number(process.env.DB_PORT) || 5432,
            database: 'postgres' // Connect to default database first
        });
        try {
            yield client.connect();
            // Force close all connections to the database
            yield client.query(`
            SELECT pg_terminate_backend(pg_stat_activity.pid)
            FROM pg_stat_activity
            WHERE pg_stat_activity.datname = 'educational_system'
            AND pid <> pg_backend_pid();
        `);
            // Drop database if exists
            yield client.query(`
            DROP DATABASE IF EXISTS educational_system;
        `);
            // Create database
            yield client.query(`
            CREATE DATABASE educational_system;
        `);
            console.log('Database created successfully');
        }
        catch (error) {
            console.error('Error creating database:', error);
        }
        finally {
            yield client.end();
        }
    });
}
createDatabase();
