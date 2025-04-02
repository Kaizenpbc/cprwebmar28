import { Knex } from 'knex';
import bcrypt from 'bcrypt';

export async function seed(knex: Knex): Promise<void> {
    try {
        // Clear existing entries
        console.log('Clearing existing data...');
        await knex('student_attendance').del().catch(() => {});
        await knex('student_registrations').del().catch(() => {});
        await knex('students').del().catch(() => {});
        await knex('instructor_availability').del().catch(() => {});
        await knex('course_instances').del().catch(() => {});
        await knex('course_types').del().catch(() => {});
        await knex('organizations').del().catch(() => {});
        await knex('users').del().catch(() => {});
        console.log('Existing data cleared');

        // Insert organizations
        console.log('Inserting organizations...');
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
        console.log('Organizations inserted');

        // Insert course types
        console.log('Inserting course types...');
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
        console.log('Course types inserted');

        // Insert users with hashed passwords
        console.log('Inserting users...');
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash('password123', saltRounds);

        const users = await knex('users').insert([
            {
                username: 'admin',
                password: hashedPassword,
                email: 'admin@example.com',
                role: 'sysAdmin',
                organization_id: org.id,
                is_active: true
            },
            {
                username: 'instructor1',
                password: hashedPassword,
                email: 'instructor1@example.com',
                role: 'instructor',
                organization_id: org.id,
                is_active: true
            },
            {
                username: 'orgadmin',
                password: hashedPassword,
                email: 'orgadmin@example.com',
                role: 'orgAdmin',
                organization_id: org.id,
                is_active: true
            },
            {
                username: 'coursemanager',
                password: hashedPassword,
                email: 'coursemanager@example.com',
                role: 'courseAdmin',
                organization_id: org.id,
                is_active: true
            },
            {
                username: 'student1',
                password: hashedPassword,
                email: 'student1@example.com',
                role: 'student',
                organization_id: org.id,
                is_active: true
            }
        ]).returning('*');
        console.log('Users inserted');

        const instructor = users.find(u => u.role === 'instructor');
        if (!instructor) {
            throw new Error('Instructor not found');
        }

        // Create test course instances
        console.log('Inserting course instances...');
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
        console.log('Course instances inserted');

        // Create test instructor availability
        console.log('Inserting instructor availability...');
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
        console.log('Instructor availability inserted');

        // Create test students
        console.log('Inserting students...');
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
        console.log('Students inserted');

        // Create test course attendance
        console.log('Inserting student attendance...');
        await knex('student_attendance').insert([
            {
                course_instance_id: courseInstances[0].id,
                student_id: students[0].id,
                attended: true,
                certification_issued: true
            },
            {
                course_instance_id: courseInstances[0].id,
                student_id: students[1].id,
                attended: false,
                certification_issued: false
            },
            {
                course_instance_id: courseInstances[1].id,
                student_id: students[2].id,
                attended: false,
                certification_issued: false
            }
        ]);
        console.log('Student attendance inserted');

        // Create test student registrations
        console.log('Inserting student registrations...');
        await knex('student_registrations').insert([
            {
                course_instance_id: courseInstances[0].id,
                student_id: students[0].id,
                registration_date: new Date(),
                is_confirmed: true
            },
            {
                course_instance_id: courseInstances[0].id,
                student_id: students[1].id,
                registration_date: new Date(),
                is_confirmed: false
            },
            {
                course_instance_id: courseInstances[1].id,
                student_id: students[2].id,
                registration_date: new Date(),
                is_confirmed: false
            }
        ]);
        console.log('Student registrations inserted');

        console.log('Seed completed successfully!');
    } catch (error) {
        console.error('Seed failed:', error);
        throw error;
    }
} 