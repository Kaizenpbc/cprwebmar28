import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
import db from './config/db';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Test endpoint with DB check
app.get('/api/test', async (req: Request, res: Response) => {
    try {
        // Test database connection
        await db.raw('SELECT 1');
        res.json({ 
            message: 'Server is running successfully!',
            dbStatus: 'Database connection successful'
        });
    } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({ 
            message: 'Server is running but database connection failed',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Health check endpoint
app.get('/api/health', async (req: Request, res: Response) => {
    try {
        await db.raw('SELECT 1');
        res.json({ 
            status: 'healthy',
            timestamp: new Date().toISOString(),
            dbStatus: 'connected'
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            dbStatus: 'disconnected',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    // Test DB connection on startup
    db.raw('SELECT 1')
        .then(() => console.log('Database connected successfully'))
        .catch(err => console.error('Database connection failed:', err));
}); 