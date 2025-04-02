import { UserRole } from './index';

export interface JwtPayload {
  userId: number;
  role: UserRole;
  organizationId?: number;
} 