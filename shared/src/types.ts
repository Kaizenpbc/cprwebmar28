// User roles
export enum UserRole {
  ADMIN = 'admin',
  ORGANIZATION_ADMIN = 'organization_admin',
  INSTRUCTOR = 'instructor',
  STUDENT = 'student'
}

// Course status
export enum CourseStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  PENDING = 'pending'
}

// User interface
export interface User {
  id: number;
  email: string;
  username: string;
  role: UserRole;
  organizationId?: number;
  isActive: boolean;
}

// Course interface
export interface Course {
  id: number;
  courseNumber: string;
  requestedDate: Date;
  organizationId: number;
  courseTypeId: number;
  instructorId: number;
  location: string;
  maxStudents: number;
  status: CourseStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Course type interface
export interface CourseType {
  id: number;
  name: string;
  code: string;
  description: string;
  organizationId: number;
}

// Organization interface
export interface Organization {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  isActive: boolean;
}

// Authentication response
export interface AuthResponse {
  token: string;
  user: User;
} 