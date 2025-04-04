import { JwtPayload } from 'jsonwebtoken';
import { UserRole } from './index';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & {
        userId: number;
        role: UserRole;
        organizationId?: number;
      };
    }
  }
} 