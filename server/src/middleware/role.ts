import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types';
import logger from '../utils/logger';

export const roleMiddleware = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        logger.warn('Role middleware - No user found in request');
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      if (!allowedRoles.includes(req.user.role)) {
        logger.warn('Role middleware - User role not allowed:', req.user.role);
        res.status(403).json({ message: 'Access denied' });
        return;
      }

      next();
    } catch (error) {
      logger.error('Role middleware - Error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
}; 