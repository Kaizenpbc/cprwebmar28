import { knex } from 'knex';
import dotenv from 'dotenv';

dotenv.config();

const db = knex({
    client: 'pg',
    connection: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'gtacpr',
        database: process.env.DB_NAME || 'educational_system'
    }
});

async function verifyData() {
    try {
        console.log('Verifying Users:');
        const users = await db('users').select('username', 'email', 'role');
        console.log(users);

        console.log('\nVerifying Organizations:');
        const organizations = await db('organizations').select('name', 'code', 'status');
        console.log(organizations);

        console.log('\nVerifying Course Types:');
        const courseTypes = await db('course_types').select('name', 'code', 'description');
        console.log(courseTypes);

        console.log('\nVerifying Course Instances:');
        const courseInstances = await db('course_instances')
            .select('course_number', 'requested_date', 'location', 'status');
        console.log(courseInstances);

        console.log('\nVerifying Students:');
        const students = await db('students').select('name', 'email');
        console.log(students);

        console.log('\nVerifying Course Attendance:');
        const attendance = await db('course_attendance').select('*');
        console.log(attendance);

    } catch (error) {
        console.error('Error verifying data:', error);
    } finally {
        await db.destroy();
    }
}

verifyData(); 