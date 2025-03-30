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
const express_1 = require("express");
const db_1 = __importDefault(require("../config/db"));
const router = (0, express_1.Router)();
// Detailed server status
router.get('/status', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const startTime = process.uptime();
    const memoryUsage = process.memoryUsage();
    try {
        const dbStatus = yield db_1.default.raw('SELECT version(), current_timestamp, current_database()');
        res.json({
            status: 'operational',
            uptime: startTime,
            timestamp: new Date().toISOString(),
            memory: {
                heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
                heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
                rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
            },
            database: {
                connected: true,
                version: dbStatus.rows[0].version,
                currentTime: dbStatus.rows[0].current_timestamp,
                database: dbStatus.rows[0].current_database
            }
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            uptime: startTime,
            timestamp: new Date().toISOString(),
            memory: {
                heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
                heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
                rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
            },
            database: {
                connected: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            }
        });
    }
}));
// Database metrics
router.get('/metrics', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [connections, activeQueries, dbSize] = yield Promise.all([
            db_1.default.raw(`SELECT count(*) FROM pg_stat_activity`),
            db_1.default.raw(`SELECT pid, query, query_start, state FROM pg_stat_activity WHERE state = 'active'`),
            db_1.default.raw(`SELECT pg_size_pretty(pg_database_size(current_database())) as size`)
        ]);
        res.json({
            timestamp: new Date().toISOString(),
            metrics: {
                activeConnections: connections.rows[0].count,
                activeQueries: activeQueries.rows,
                databaseSize: dbSize.rows[0].size
            }
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));
// Connection pool status
router.get('/pool', (req, res) => {
    const pool = db_1.default.client.pool;
    res.json({
        timestamp: new Date().toISOString(),
        pool: {
            min: pool.min,
            max: pool.max,
            numUsed: pool.numUsed(),
            numFree: pool.numFree(),
            numPendingAcquires: pool.numPendingAcquires(),
            numPendingCreates: pool.numPendingCreates()
        }
    });
});
exports.default = router;
