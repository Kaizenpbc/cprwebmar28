import { pool } from '../config/db';

async function checkDatabase() {
    try {
        // Check users table
        console.log('\nChecking users table:');
        const users = await pool.query('SELECT id, email, role FROM users');
        console.log(users.rows);

        // Check organizations table
        console.log('\nChecking organizations table:');
        const orgs = await pool.query('SELECT id, name, phone FROM organizations');
        console.log(orgs.rows);

        // Check course types table
        console.log('\nChecking course types table:');
        const courseTypes = await pool.query('SELECT id, name, description, duration, price FROM course_types');
        console.log(courseTypes.rows);

        // Check course instances table
        console.log('\nChecking course instances table:');
        const courseInstances = await pool.query('SELECT id, course_number, date, status FROM course_instances');
        console.log(courseInstances.rows);

        // Check students table
        console.log('\nChecking students table:');
        const students = await pool.query('SELECT id, first_name, last_name, email FROM students');
        console.log(students.rows);

        // Check student registrations table
        console.log('\nChecking student registrations table:');
        const registrations = await pool.query('SELECT id, student_id, course_instance_id, status FROM student_registrations');
        console.log(registrations.rows);

        // Check student attendance table
        console.log('\nChecking student attendance table:');
        const attendance = await pool.query('SELECT id, student_registration_id, attendance_date, status FROM student_attendance');
        console.log(attendance.rows);

    } catch (error) {
        console.error('Error checking database:', error);
    } finally {
        await pool.end();
    }
}

checkDatabase(); 