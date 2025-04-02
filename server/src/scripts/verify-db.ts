import { db } from '../config/db';
import logger from '../utils/logger';

interface TableRow {
    table_name: string;
}

async function verifyDatabase() {
    try {
        // Check if tables exist
        const tables = await db.raw(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        logger.info('Existing tables:', tables.rows.map((r: TableRow) => r.table_name));

        // Check instructor_availability table
        const instructorAvailability = await db('instructor_availability').select('*').limit(1);
        logger.info('instructor_availability sample:', instructorAvailability);

        // Check course_instances table
        const courseInstances = await db('course_instances').select('*').limit(1);
        logger.info('course_instances sample:', courseInstances);

        // Check organizations table
        const organizations = await db('organizations').select('*').limit(1);
        logger.info('organizations sample:', organizations);

        // Check course_types table
        const courseTypes = await db('course_types').select('*').limit(1);
        logger.info('course_types sample:', courseTypes);

        // Check student_registrations table
        const studentRegistrations = await db('student_registrations').select('*').limit(1);
        logger.info('student_registrations sample:', studentRegistrations);

        // Check student_attendance table
        const studentAttendance = await db('student_attendance').select('*').limit(1);
        logger.info('student_attendance sample:', studentAttendance);

    } catch (error) {
        logger.error('Error verifying database:', error);
    } finally {
        process.exit(0);
    }
}

verifyDatabase(); 