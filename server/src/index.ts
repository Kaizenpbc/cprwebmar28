import express from 'express';
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
import { corsMiddleware } from './middleware/cors';
import { Request, Response } from 'express';
import { startHealthCheck } from './utils/healthCheck';

// Set default NODE_ENV if not set
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envFile });

// Log the environment being used
logger.info(`Loading environment from ${envFile}`);

export const app = express();
const port = process.env.PORT || 9005;

// Enhanced request tracing middleware
app.use((req, res, next) => {
  const start = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  logger.debug('Incoming Request:', {
    requestId,
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body,
    query: req.query,
    params: req.params,
    timestamp: new Date().toISOString()
  });

  // Log response
  const originalSend = res.send;
  res.send = function(body) {
    const duration = Date.now() - start;
    logger.debug('Outgoing Response:', {
      requestId,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      body: body,
      headers: res.getHeaders(),
      timestamp: new Date().toISOString()
    });
    return originalSend.call(this, body);
  };

  next();
});

// Middleware
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
app.get('/health', (_req: Request, res: Response) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    database: db.client.pool ? 'connected' : 'disconnected'
  };
  
  logger.info('Health check:', health);
  return res.status(200).json(health);
});

// Error handling
app.use(errorHandler);

// Database connection and server startup
const startServer = async () => {
  let server: import('http').Server | undefined;
  try {
    // Test database connection
    await db.raw('SELECT NOW()');
    logger.info('Database connected successfully');

    server = app.listen(port, () => {
      logger.info(`Server is running on port ${port} in ${process.env.NODE_ENV} mode`);
      
      // Start health check monitoring
      startHealthCheck();
    });

    // Add server error handling
    server.on('error', (error) => {
      logger.error('Server error:', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      
      // Properly close the server before exiting
      if (server) {
        server.close(() => {
          logger.info('Server closed');
          process.exit(1);
        });
      } else {
        process.exit(1);
      }
    });

    // Monitor server responsiveness
    setInterval(async () => {
      try {
        await db.raw('SELECT NOW()');
      } catch (error) {
        logger.error('Database connection lost:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString()
        });
        
        // Properly close the server before exiting
        if (server) {
          server.close(() => {
            logger.info('Server closed');
            process.exit(1);
          });
        } else {
          process.exit(1);
        }
      }
    }, 30000); // Check every 30 seconds

  } catch (err) {
    logger.error('Failed to start server:', {
      error: err,
      stack: err instanceof Error ? err.stack : undefined,
      timestamp: new Date().toISOString()
    });
    createCrashDump(err as Error);
    
    // Properly close the server before exiting
    if (server) {
      server.close(() => {
        logger.info('Server closed');
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  }
  
  return server;
};

// Handle shutdown gracefully
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  
  try {
    // Close database connection
    await db.destroy();
    logger.info('Database connection closed.');
    
    // Exit the process
    process.exit(0);
  } catch (err) {
    logger.error('Error during shutdown:', {
      error: err,
      stack: err instanceof Error ? err.stack : undefined,
      timestamp: new Date().toISOString()
    });
    createCrashDump(err as Error);
    process.exit(1);
  }
};

// Register shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', {
    error: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString()
  });
  createCrashDump(err);
  gracefulShutdown('uncaughtException');
});
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', {
    reason,
    promise,
    timestamp: new Date().toISOString()
  });
  gracefulShutdown('unhandledRejection');
});

startServer(); 