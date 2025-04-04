import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types/user';
import logger from '../utils/logger';

export const roleMiddleware = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        logger.warn('Role middleware - No user found in request');
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      // Convert string role to UserRole enum
      const userRole = req.user.role;
      const allowedRoleValues = allowedRoles.map(role => role.toString());
      
      if (!allowedRoleValues.includes(userRole)) {
        logger.warn('Role middleware - User role not allowed:', {
          userRole,
          allowedRoles: allowedRoleValues
        });
        res.status(403).json({ success: false, message: 'Forbidden' });
        return;
      }

      next();
    } catch (error) {
      logger.error('Role middleware error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      res.status(500).json({ success: false, message: 'Error checking role' });
    }
  };
}; 