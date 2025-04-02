import { db } from './config/db';

async function checkDatabase() {
    try {
        // Test connection
        await db.raw('SELECT 1');
        console.log('Database connection successful');

        // List tables
        const tables = await db.raw(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('\nTables in database:');
        console.log(tables.rows);

        // Get current database name
        const dbInfo = await db.raw('SELECT current_database()');
        console.log('\nCurrent database:', dbInfo.rows[0].current_database);

        // Get student_attendance table structure
        const tableInfo = await db.raw(`
            SELECT column_name, data_type, column_default, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'student_attendance'
            ORDER BY ordinal_position;
        `);
        console.log('\nstudent_attendance table structure:');
        console.log(tableInfo.rows);

        // Get sample data from student_attendance
        const sampleData = await db.raw(`
            SELECT sa.*, ci.course_number, s.name as student_name
            FROM student_attendance sa
            JOIN course_instances ci ON sa.course_instance_id = ci.id
            JOIN students s ON sa.student_id = s.id
            LIMIT 5;
        `);
        console.log('\nSample data from student_attendance:');
        console.log(sampleData.rows);

        // Get count of records
        const countData = await db.raw(`
            SELECT COUNT(*) as total_records
            FROM student_attendance;
        `);
        console.log('\nTotal records in student_attendance:', countData.rows[0].total_records);

    } catch (error) {
        console.error('Database error:', error);
    } finally {
        await db.destroy();
    }
}

checkDatabase(); 