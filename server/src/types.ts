export enum UserRole {
  ADMIN = 'admin',
  INSTRUCTOR = 'instructor',
  ORGANIZATION_ADMIN = 'organization_admin',
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
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Course {
  id: number;
  name: string;
  description: string;
  duration: number;
  price: number;
  organizationId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseInstance {
  id: number;
  courseId: number;
  instructorId: number;
  startDate: Date;
  endDate: Date;
  location: string;
  maxStudents: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  organizationId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Enrollment {
  id: number;
  studentId: number;
  courseInstanceId: number;
  status: 'enrolled' | 'completed' | 'dropped';
  createdAt: Date;
  updatedAt: Date;
}

export interface Attendance {
  id: number;
  studentId: number;
  courseInstanceId: number;
  date: Date;
  status: 'present' | 'absent' | 'excused';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InstructorAvailability {
  id: number;
  instructorId: number;
  date: Date;
  startTime: string;
  endTime: string;
  createdAt: Date;
  updatedAt: Date;
} 