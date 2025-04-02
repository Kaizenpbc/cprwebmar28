import { pool } from '../db';

async function dropTables() {
    try {
        // Drop tables in correct order to handle foreign key constraints
        const tables = [
            'student_attendance',
            'student_registrations',
            'students',
            'instructor_availability',
            'course_instances',
            'course_types',
            'organizations',
            'users'
        ];

        for (const table of tables) {
            console.log(`Dropping table ${table}...`);
            await pool.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
        }

        console.log('All tables dropped successfully');
    } catch (error) {
        console.error('Error dropping tables:', error);
    } finally {
        await pool.end();
    }
}

dropTables(); 