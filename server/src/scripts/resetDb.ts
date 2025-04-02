import { pool } from '../db';

async function resetDatabase() {
    try {
        // Drop all tables in correct order
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

        // Drop enum types
        const types = [
            'user_role',
            'org_status',
            'course_status',
            'availability_status'
        ];

        for (const type of types) {
            console.log(`Dropping type ${type}...`);
            await pool.query(`DROP TYPE IF EXISTS ${type}`);
        }

        console.log('Database reset successfully');
    } catch (error) {
        console.error('Error resetting database:', error);
    } finally {
        await pool.end();
    }
}

resetDatabase(); 