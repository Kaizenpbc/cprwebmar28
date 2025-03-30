import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
import db from './config/db';
import monitoringRoutes from './routes/monitoring';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import organizationRoutes from './routes/organizations';
import instructorRoutes from './routes/instructors';
import courseTypesRouter from './routes/courseTypes';
import accountingRoutes from './routes/accounting';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 9005;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/instructors', instructorRoutes);
app.use('/api/monitoring', monitoringRoutes);
app.use('/api/course-types', courseTypesRouter);
app.use('/api/accounting', accountingRoutes);

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

// Test database connection
db.raw('SELECT 1')
    .then(() => {
        console.log('Database connected successfully');
    })
    .catch((err) => {
        console.error('Database connection error:', err);
    });

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 