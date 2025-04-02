import fs from 'fs';
import path from 'path';
import os from 'os';
import logger from './logger';

interface CrashDumpData {
  timestamp: string;
  error: {
    message: string;
    stack: string;
    name: string;
  };
  system: {
    platform: string;
    arch: string;
    hostname: string;
    uptime: number;
    memory: {
      total: number;
      free: number;
      used: number;
    };
  };
  process: {
    pid: number;
    uptime: number;
    memory: {
      heapUsed: number;
      heapTotal: number;
      external: number;
    };
  };
  request?: {
    path: string;
    method: string;
    headers: any;
    body: any;
    query: any;
  };
}

export const createCrashDump = (error: Error, req?: any): void => {
  try {
    const dumpData: CrashDumpData = {
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        stack: error.stack || '',
        name: error.name,
      },
      system: {
        platform: process.platform,
        arch: process.arch,
        hostname: os.hostname(),
        uptime: os.uptime(),
        memory: {
          total: os.totalmem(),
          free: os.freemem(),
          used: os.totalmem() - os.freemem(),
        },
      },
      process: {
        pid: process.pid,
        uptime: process.uptime(),
        memory: {
          heapUsed: process.memoryUsage().heapUsed,
          heapTotal: process.memoryUsage().heapTotal,
          external: process.memoryUsage().external,
        },
      },
    };

    if (req) {
      dumpData.request = {
        path: req.path,
        method: req.method,
        headers: req.headers,
        body: req.body,
        query: req.query,
      };
    }

    const dumpDir = path.join(__dirname, '../../logs/crash-dumps');
    if (!fs.existsSync(dumpDir)) {
      fs.mkdirSync(dumpDir, { recursive: true });
    }

    const dumpFile = path.join(dumpDir, `crash-${Date.now()}.json`);
    fs.writeFileSync(dumpFile, JSON.stringify(dumpData, null, 2));

    logger.error('Crash dump created:', { dumpFile });
  } catch (dumpError) {
    logger.error('Failed to create crash dump:', { error: dumpError });
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', { error });
  createCrashDump(error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', { reason, promise });
  createCrashDump(reason as Error);
  process.exit(1);
}); 