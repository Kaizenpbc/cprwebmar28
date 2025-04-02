import { Knex } from 'knex';
import bcrypt from 'bcryptjs';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('student_attendance').del();
  await knex('student_registrations').del();
  await knex('students').del();
  await knex('course_instances').del();
  await knex('course_types').del();
  await knex('instructor_availability').del();
  await knex('users').del();
  await knex('organizations').del();

  // Inserts seed entries
  const [organization] = await knex('organizations').insert([
    {
      name: 'CPR Training Center',
      created_at: new Date(),
      updated_at: new Date()
    }
  ]).returning('*');

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash('password123', saltRounds);

  const users = await knex('users').insert([
    {
      username: 'admin',
      password: hashedPassword,
      email: 'admin@example.com',
      role: 'sysAdmin',
      organization_id: organization.id,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      username: 'instructor1',
      password: hashedPassword,
      email: 'instructor1@example.com',
      role: 'instructor',
      organization_id: organization.id,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      username: 'orgadmin',
      password: hashedPassword,
      email: 'orgadmin@example.com',
      role: 'orgAdmin',
      organization_id: organization.id,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      username: 'coursemanager',
      password: hashedPassword,
      email: 'coursemanager@example.com',
      role: 'courseAdmin',
      organization_id: organization.id,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      username: 'student1',
      password: hashedPassword,
      email: 'student1@example.com',
      role: 'student',
      organization_id: organization.id,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]).returning('*');

  const instructor = users.find(u => u.role === 'instructor');
  if (!instructor) {
    throw new Error('Instructor not found');
  }

  const courseTypes = await knex('course_types').insert([
    {
      name: 'Basic Life Support (BLS)',
      description: 'Learn basic life support techniques including CPR and AED use',
      duration_minutes: 180,
      price: 150.00,
      organization_id: organization.id,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      name: 'Advanced Cardiac Life Support (ACLS)',
      description: 'Advanced life support techniques for healthcare providers',
      duration_minutes: 240,
      price: 250.00,
      organization_id: organization.id,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]).returning('*');

  const courseInstances = await knex('course_instances').insert([
    {
      course_number: '2024-04-01-SAM-BLS',
      requested_date: '2024-04-01',
      organization_id: organization.id,
      course_type_id: courseTypes[0].id,
      instructor_id: instructor.id,
      location: 'Room 101',
      max_students: 10,
      status: 'scheduled',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      course_number: '2024-04-15-SAM-ACL',
      requested_date: '2024-04-15',
      organization_id: organization.id,
      course_type_id: courseTypes[1].id,
      instructor_id: instructor.id,
      location: 'Room 202',
      max_students: 8,
      status: 'pending',
      created_at: new Date(),
      updated_at: new Date()
    }
  ]).returning('*');

  await knex('instructor_availability').insert([
    {
      instructor_id: instructor.id,
      date: '2024-04-01',
      status: 'scheduled',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      instructor_id: instructor.id,
      date: '2024-04-15',
      status: 'available',
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);

  const students = await knex('students').insert([
    {
      name: 'John Doe',
      email: 'john@example.com',
      organization_id: organization.id,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      name: 'Jane Smith',
      email: 'jane@example.com',
      organization_id: organization.id,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      name: 'Bob Wilson',
      email: 'bob@example.com',
      organization_id: organization.id,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]).returning('*');

  await knex('student_attendance').insert([
    {
      course_instance_id: courseInstances[0].id,
      student_id: students[0].id,
      attended: true,
      certification_issued: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      course_instance_id: courseInstances[0].id,
      student_id: students[1].id,
      attended: false,
      certification_issued: false,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      course_instance_id: courseInstances[1].id,
      student_id: students[2].id,
      attended: false,
      certification_issued: false,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);

  await knex('student_registrations').insert([
    {
      course_instance_id: courseInstances[0].id,
      student_id: students[0].id,
      registration_date: new Date(),
      is_confirmed: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      course_instance_id: courseInstances[0].id,
      student_id: students[1].id,
      registration_date: new Date(),
      is_confirmed: false,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      course_instance_id: courseInstances[1].id,
      student_id: students[2].id,
      registration_date: new Date(),
      is_confirmed: false,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
} 