import { Knex } from 'knex';
import bcrypt from 'bcrypt';

export async function seed(knex: Knex): Promise<void> {
    // Clear existing entries
    await knex('course_attendance').del();
    await knex('students').del();
    await knex('instructor_availability').del();
    await knex('course_instances').del();
    await knex('course_types').del();
    await knex('organizations').del();
    await knex('users').del();

    // Insert organizations
    const [org] = await knex('organizations').insert([
        {
            name: 'Sample Organization',
            code: 'SAM',
            status: 'active',
            settings: JSON.stringify({
                billing_address: '123 Main St',
                phone: '555-0123'
            })
        }
    ]).returning('*');

    // Insert course types
    const courseTypes = await knex('course_types').insert([
        {
            name: 'Basic Life Support',
            code: 'BLS',
            description: 'Basic Life Support certification course'
        },
        {
            name: 'Advanced Cardiac Life Support',
            code: 'ACL',
            description: 'Advanced Cardiac Life Support certification course'
        },
        {
            name: 'Pediatric Advanced Life Support',
            code: 'PAL',
            description: 'Pediatric Advanced Life Support certification course'
        }
    ]).returning('*');

    // Insert users with hashed passwords
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('password123', saltRounds);

    const users = await knex('users').insert([
        {
            username: 'admin',
            password: hashedPassword,
            email: 'admin@example.com',
            role: 'sysAdmin',
            is_active: true
        },
        {
            username: 'instructor1',
            password: hashedPassword,
            email: 'instructor1@example.com',
            role: 'instructor',
            is_active: true
        },
        {
            username: 'orgadmin',
            password: hashedPassword,
            email: 'orgadmin@example.com',
            role: 'orgAdmin',
            is_active: true
        },
        {
            username: 'coursemanager',
            password: hashedPassword,
            email: 'coursemanager@example.com',
            role: 'courseAdmin',
            is_active: true
        },
        {
            username: 'student1',
            password: hashedPassword,
            email: 'student1@example.com',
            role: 'student',
            is_active: true
        }
    ]).returning('*');

    const instructor = users.find(u => u.role === 'instructor');
    if (!instructor) {
        throw new Error('Instructor not found');
    }

    // Create test course instances
    const courseInstances = await knex('course_instances').insert([
        {
            course_number: '2024-04-01-SAM-BLS',
            requested_date: '2024-04-01',
            organization_id: org.id,
            course_type_id: courseTypes[0].id,
            instructor_id: instructor.id,
            location: 'Room 101',
            max_students: 10,
            status: 'scheduled'
        },
        {
            course_number: '2024-04-15-SAM-ACL',
            requested_date: '2024-04-15',
            organization_id: org.id,
            course_type_id: courseTypes[1].id,
            instructor_id: instructor.id,
            location: 'Room 202',
            max_students: 8,
            status: 'pending'
        }
    ]).returning('*');

    // Create test instructor availability
    await knex('instructor_availability').insert([
        {
            instructor_id: instructor.id,
            date: '2024-04-01',
            status: 'scheduled'
        },
        {
            instructor_id: instructor.id,
            date: '2024-04-15',
            status: 'available'
        }
    ]);

    // Create test students
    const students = await knex('students').insert([
        {
            name: 'John Doe',
            email: 'john@example.com',
            organization_id: org.id
        },
        {
            name: 'Jane Smith',
            email: 'jane@example.com',
            organization_id: org.id
        },
        {
            name: 'Bob Wilson',
            email: 'bob@example.com',
            organization_id: org.id
        }
    ]).returning('*');

    // Create test course attendance
    await knex('course_attendance').insert([
        {
            course_instance_id: courseInstances[0].id,
            student_id: students[0].id,
            attended: true
        },
        {
            course_instance_id: courseInstances[0].id,
            student_id: students[1].id,
            attended: false
        },
        {
            course_instance_id: courseInstances[1].id,
            student_id: students[2].id,
            attended: false
        }
    ]);
} 