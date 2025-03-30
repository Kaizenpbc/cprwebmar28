import { Router, Request, Response } from 'express';
import db from '../config/db';

const router = Router();

// Detailed server status
router.get('/status', async (req: Request, res: Response) => {
    const startTime = process.uptime();
    const memoryUsage = process.memoryUsage();
    
    try {
        const dbStatus = await db.raw('SELECT version(), current_timestamp, current_database()');
        
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
    } catch (error) {
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
});

// Database metrics
router.get('/metrics', async (req: Request, res: Response) => {
    try {
        const [connections, activeQueries, dbSize] = await Promise.all([
            db.raw(`SELECT count(*) FROM pg_stat_activity`),
            db.raw(`SELECT pid, query, query_start, state FROM pg_stat_activity WHERE state = 'active'`),
            db.raw(`SELECT pg_size_pretty(pg_database_size(current_database())) as size`)
        ]);

        res.json({
            timestamp: new Date().toISOString(),
            metrics: {
                activeConnections: connections.rows[0].count,
                activeQueries: activeQueries.rows,
                databaseSize: dbSize.rows[0].size
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Connection pool status
router.get('/pool', (req: Request, res: Response) => {
    const pool = db.client.pool;
    
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

export default router; 