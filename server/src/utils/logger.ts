import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log format with more detailed information
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create logger instance with debug level for maximum tracing
const logger = winston.createLogger({
  level: 'debug', // Set to debug for maximum tracing
  format: logFormat,
  transports: [
    // Console transport for development with colors and more visible error formatting
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, ...metadata }) => {
          let msg = `${timestamp} [${level}]: ${message}`;
          if (Object.keys(metadata).length > 0) {
            msg += `\n${JSON.stringify(metadata, null, 2)}`;
          }
          if (level === 'error') {
            msg = `\n🚨 CRITICAL ERROR 🚨\n${msg}\n🚨 CRITICAL ERROR 🚨\n`;
          }
          return msg;
        })
      ),
    }),
    // File transport for all logs
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error',
    }),
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/combined.log'),
    }),
  ],
});

// Add request logging middleware with detailed request information
export const requestLogger = (req: Request, _res: Response, next: NextFunction) => {
  logger.debug('Incoming Request:', {
    path: req.path,
    method: req.method,
    url: req.url,
    body: req.body,
    query: req.query,
    params: req.params,
    headers: req.headers,
    ip: req.ip,
    timestamp: new Date().toISOString(),
    userAgent: req.get('user-agent'),
    contentType: req.get('content-type'),
    accept: req.get('accept'),
    cookies: req.cookies,
    originalUrl: req.originalUrl,
    protocol: req.protocol,
    secure: req.secure,
    hostname: req.hostname,
    subdomains: req.subdomains,
    xhr: req.xhr,
  });
  next();
};

// Add response logging middleware with detailed response information
export const responseLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const originalSend = res.send;
  res.send = function (body: any) {
    logger.debug('Outgoing Response:', {
      path: req.path,
      method: req.method,
      statusCode: res.statusCode,
      statusMessage: res.statusMessage,
      body: body,
      headers: res.getHeaders(),
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime,
      contentType: res.get('content-type'),
      contentLength: res.get('content-length'),
    });
    return originalSend.call(this, body);
  };
  next();
};

// Add error logging middleware with detailed error information
export const errorLogger = (err: any, req: Request, _res: Response, next: NextFunction) => {
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    url: req.url,
    body: req.body,
    query: req.query,
    params: req.params,
    headers: req.headers,
    ip: req.ip,
    timestamp: new Date().toISOString(),
    errorName: err.name,
    errorCode: err.code,
    errorStatus: err.status,
    errorDetails: err.details,
    errorStack: err.stack,
    errorCause: err.cause,
    errorContext: err.context,
  });
  next(err);
};

// Add error event logging with detailed process information
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', {
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    processId: process.pid,
    processUptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    cpuUsage: process.cpuUsage(),
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logger.error('Unhandled Rejection:', {
    reason: reason?.message || reason,
    stack: reason?.stack,
    promise: promise,
    timestamp: new Date().toISOString(),
    processId: process.pid,
    processUptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
  });
});

// Memory usage logging with more detailed information
setInterval(() => {
  const memoryUsage = process.memoryUsage();
  logger.debug('Memory Usage:', {
    rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
    heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
    external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
    timestamp: new Date().toISOString(),
    processId: process.pid,
    processUptime: process.uptime(),
    cpuUsage: process.cpuUsage(),
  });
}, 300000); // Log every 5 minutes

export default logger; 