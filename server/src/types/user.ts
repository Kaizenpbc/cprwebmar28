export enum UserRole {
  SYSADMIN = 'sysAdmin',
  ORGADMIN = 'orgAdmin',
  COURSEADMIN = 'courseAdmin',
  INSTRUCTOR = 'instructor',
  STUDENT = 'student'
}

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  organizationId?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface JwtPayload {
  userId: number;
  role: string;
  email: string;
  organizationId?: number;
} 