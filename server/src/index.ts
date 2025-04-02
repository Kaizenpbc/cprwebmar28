import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/error';
import logger, { requestLogger, responseLogger, errorLogger } from './utils/logger';
import { createCrashDump } from './utils/crashDump';
import { db } from './config/db';
import monitoringRoutes from './routes/monitoring';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import organizationRoutes from './routes/organization';
import instructorRoutes from './routes/instructors';
import instructorRouter from './routes/instructor';
import courseTypesRouter from './routes/courseTypes';
import accountingRoutes from './routes/accounting';
import dashboardRoutes from './routes/dashboard';
import studentRoutes from './routes/students';
import attendanceRoutes from './routes/attendance';
import { apiLimiter, authLimiter } from './middleware/rateLimiter';

// Set default NODE_ENV if not set
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envFile });

// Log the environment being used
logger.info(`Loading environment from ${envFile}`);

const app = express();
const port = process.env.PORT || 9005;

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(responseLogger);
app.use(errorLogger);

// Apply rate limiting
app.use('/api/', apiLimiter);
app.use('/api/auth', authLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/instructor', instructorRouter);
app.use('/api/instructors', instructorRoutes);
app.use('/api/organization', organizationRoutes);
app.use('/api/course-types', courseTypesRouter);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/monitoring', monitoringRoutes);
app.use('/api/accounting', accountingRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: 'connected'
  });
});

// Error handling
app.use(errorHandler);

// Database connection and server startup
const startServer = async () => {
  try {
    // Test database connection
    await db.raw('SELECT NOW()');
    logger.info('Database connected successfully');

    app.listen(port, () => {
      logger.info(`Server is running on port ${port} in ${process.env.NODE_ENV} mode`);
    });
  } catch (err) {
    logger.error('Failed to start server:', {
      error: err,
      stack: err instanceof Error ? err.stack : undefined,
      timestamp: new Date().toISOString()
    });
    createCrashDump(err as Error);
    process.exit(1);
  }
};

// Handle shutdown gracefully
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  db.destroy()
    .then(() => {
      logger.info('Database connection closed.');
      process.exit(0);
    })
    .catch((err: Error) => {
      logger.error('Error during shutdown:', {
        error: err,
        stack: err.stack,
        timestamp: new Date().toISOString()
      });
      createCrashDump(err);
      process.exit(1);
    });
});

startServer(); 