import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';
import db from './config/db';
import monitoringRoutes from './routes/monitoring';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import organizationRoutes from './routes/organizations';
import instructorRoutes from './routes/instructors';
import instructorRouter from './routes/instructor';
import courseTypesRouter from './routes/courseTypes';
import accountingRoutes from './routes/accounting';
import dashboardRoutes from './routes/dashboard';

// Load environment variables
dotenv.config();

export const app = express();
const port = process.env.PORT || 9005;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://192.168.2.97:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/instructor', instructorRouter);
app.use('/api/monitoring', monitoringRoutes);
app.use('/api/course-types', courseTypesRouter);
app.use('/api/accounting', accountingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/instructors', instructorRoutes);

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

// Enhanced error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] Server Error:`, {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        body: req.body,
        query: req.query
    });

    res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        timestamp
    });
});

// Health check endpoint with enhanced logging
app.get('/api/health', (req: Request, res: Response) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Health check requested`);
    res.json({ 
        status: 'ok', 
        timestamp,
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
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