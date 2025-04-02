export enum UserRole {
  ADMIN = 'admin',
  ORGANIZATION_ADMIN = 'organization',
  INSTRUCTOR = 'instructor',
  STUDENT = 'student'
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationId?: number;
}

export interface Organization {
  id: number;
  name: string;
  phone: string;
}

export interface Course {
  id: number;
  name: string;
  description: string;
  instructorId: number;
  organizationId: number;
  startDate: Date;
  endDate: Date;
  status: string;
}

export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  organizationId: number;
}

export interface Attendance {
  id: number;
  studentId: number;
  courseId: number;
  date: Date;
  status: string;
  notes?: string;
} 