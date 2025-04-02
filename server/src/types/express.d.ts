import { UserRole } from '../types';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: UserRole;
        organizationId?: number;
      };
    }
  }
} 