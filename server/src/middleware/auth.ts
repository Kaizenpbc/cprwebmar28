import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';
import { UserRole } from '../types';

interface JwtPayload {
  id: number;
  userId: number;
  role: string;
  email: string;
  organizationId?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const requestId = req.headers['x-request-id'] || Math.random().toString(36).substring(7);
  
  try {
    const authHeader = req.headers.authorization;
    
    logger.debug('Auth middleware - Processing request:', {
      requestId,
      authHeader: authHeader ? 'Present' : 'Missing',
      timestamp: new Date().toISOString()
    });

    if (!authHeader) {
      logger.warn('Auth middleware - No authorization header:', {
        requestId,
        timestamp: new Date().toISOString()
      });
      res.status(401).json({ success: false, message: 'No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      logger.warn('Auth middleware - Invalid token format:', {
        requestId,
        authHeader,
        timestamp: new Date().toISOString()
      });
      res.status(401).json({ success: false, message: 'Invalid token format' });
      return;
    }

    logger.debug('Auth middleware - Verifying token:', {
      requestId,
      token: token.substring(0, 10) + '...', // Log only first 10 chars for security
      timestamp: new Date().toISOString()
    });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JwtPayload;
    
    logger.debug('Auth middleware - Token verified successfully:', {
      requestId,
      userId: decoded.userId,
      role: decoded.role,
      timestamp: new Date().toISOString()
    });

    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Auth middleware - Token verification failed:', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

export const roleMiddleware = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      // Handle case where role is "orgAdmin" instead of "organization_admin"
      const userRole = (req.user.role as string) === 'orgAdmin' ? UserRole.ORGANIZATION_ADMIN : req.user.role as UserRole;

      if (!allowedRoles.includes(userRole)) {
        res.status(403).json({ message: 'Forbidden' });
        return;
      }

      next();
    } catch (error) {
      logger.error('Role middleware error:', error);
      res.status(500).json({ message: 'Error checking role' });
    }
  };
}; 