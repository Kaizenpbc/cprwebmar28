import { db } from '../config/db';

async function createTables() {
    try {
        console.log('\n=== Creating Database Tables ===\n');

        // Create enum types
        console.log('Creating enum types...');
        await db.raw(`
            DO $$ BEGIN
                CREATE TYPE user_role AS ENUM ('instructor', 'student', 'sysAdmin', 'orgAdmin', 'accounting', 'courseAdmin');
                CREATE TYPE org_status AS ENUM ('active', 'inactive', 'suspended');
                CREATE TYPE course_status AS ENUM ('pending', 'scheduled', 'completed', 'billed');
                CREATE TYPE availability_status AS ENUM ('available', 'scheduled', 'completed');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);
        console.log('✓ Enum types created');

        // Create organizations table
        console.log('\nCreating organizations table...');
        await db.raw(`
            CREATE TABLE IF NOT EXISTS organizations (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                code VARCHAR(3) NOT NULL UNIQUE,
                status org_status DEFAULT 'active',
                settings JSONB DEFAULT '{}',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✓ Organizations table created');

        // Create users table
        console.log('\nCreating users table...');
        await db.raw(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                role user_role NOT NULL,
                organization_id INTEGER REFERENCES organizations(id),
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✓ Users table created');

        // Create course types table
        console.log('\nCreating course types table...');
        await db.raw(`
            CREATE TABLE IF NOT EXISTS course_types (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                code VARCHAR(3) NOT NULL UNIQUE,
                description TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✓ Course types table created');

        // Create course instances table
        console.log('\nCreating course instances table...');
        await db.raw(`
            CREATE TABLE IF NOT EXISTS course_instances (
                id SERIAL PRIMARY KEY,
                course_number VARCHAR(255) NOT NULL UNIQUE,
                requested_date DATE NOT NULL,
                organization_id INTEGER REFERENCES organizations(id),
                course_type_id INTEGER REFERENCES course_types(id),
                instructor_id INTEGER REFERENCES users(id),
                location VARCHAR(255) NOT NULL,
                max_students INTEGER,
                status course_status DEFAULT 'pending',
                notes TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✓ Course instances table created');

        // Create instructor availability table
        console.log('\nCreating instructor availability table...');
        await db.raw(`
            CREATE TABLE IF NOT EXISTS instructor_availability (
                id SERIAL PRIMARY KEY,
                instructor_id INTEGER REFERENCES users(id) NOT NULL,
                date DATE NOT NULL,
                day_of_week INTEGER,
                status availability_status DEFAULT 'available',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(instructor_id, date)
            );
        `);
        console.log('✓ Instructor availability table created');

        // Create students table
        console.log('\nCreating students table...');
        await db.raw(`
            CREATE TABLE IF NOT EXISTS students (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255),
                organization_id INTEGER REFERENCES organizations(id),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✓ Students table created');

        // Create student registrations table
        console.log('\nCreating student registrations table...');
        await db.raw(`
            CREATE TABLE IF NOT EXISTS student_registrations (
                id SERIAL PRIMARY KEY,
                course_instance_id INTEGER REFERENCES course_instances(id) NOT NULL,
                student_id INTEGER REFERENCES students(id) NOT NULL,
                registration_date DATE NOT NULL DEFAULT CURRENT_DATE,
                is_confirmed BOOLEAN DEFAULT false,
                notes TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(course_instance_id, student_id)
            );
        `);
        console.log('✓ Student registrations table created');

        // Create student attendance table
        console.log('\nCreating student attendance table...');
        await db.raw(`
            CREATE TABLE IF NOT EXISTS student_attendance (
                id SERIAL PRIMARY KEY,
                course_instance_id INTEGER REFERENCES course_instances(id) NOT NULL,
                student_id INTEGER REFERENCES students(id) NOT NULL,
                attended BOOLEAN DEFAULT false,
                certification_issued BOOLEAN DEFAULT false,
                notes TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(course_instance_id, student_id)
            );
        `);
        console.log('✓ Student attendance table created');

        // Create indexes
        console.log('\nCreating indexes...');
        await db.raw(`
            CREATE INDEX IF NOT EXISTS idx_student_registrations_course_instance ON student_registrations(course_instance_id);
            CREATE INDEX IF NOT EXISTS idx_student_registrations_student ON student_registrations(student_id);
            CREATE INDEX IF NOT EXISTS idx_student_attendance_course_instance ON student_attendance(course_instance_id);
            CREATE INDEX IF NOT EXISTS idx_student_attendance_student ON student_attendance(student_id);
        `);
        console.log('✓ Indexes created');

        // Create trigger function
        console.log('\nCreating trigger function...');
        await db.raw(`
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ language 'plpgsql';
        `);
        console.log('✓ Trigger function created');

        // Create triggers
        console.log('\nCreating triggers...');
        await db.raw(`
            CREATE TRIGGER update_student_registrations_updated_at
                BEFORE UPDATE ON student_registrations
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();

            CREATE TRIGGER update_student_attendance_updated_at
                BEFORE UPDATE ON student_attendance
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        `);
        console.log('✓ Triggers created');

        console.log('\n=== All Tables Created Successfully! ===\n');
        process.exit(0);
    } catch (error) {
        console.error('\n=== Error Creating Tables ===\n');
        console.error('Error details:', error);
        process.exit(1);
    }
}

createTables(); 