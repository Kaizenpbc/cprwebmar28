import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    console.log('\n=== Starting Migration ===\n');
    
    try {
        console.log('Step 1: Creating enum types...');
        // Create enum types first
        await knex.raw(`
            DO $$ BEGIN
                CREATE TYPE user_role AS ENUM ('instructor', 'student', 'sysAdmin', 'orgAdmin', 'accounting', 'courseAdmin');
                CREATE TYPE org_status AS ENUM ('active', 'inactive', 'suspended');
                CREATE TYPE course_status AS ENUM ('pending', 'scheduled', 'completed', 'billed');
                CREATE TYPE availability_status AS ENUM ('available', 'scheduled', 'completed');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);
        console.log('✓ Enum types created successfully');

        console.log('\nStep 2: Creating organizations table...');
        // Organizations table
        await knex.schema.createTable('organizations', (table) => {
            table.increments('id').primary();
            table.string('name').notNullable();
            table.string('code', 3).notNullable().unique(); // First 3 letters for course number
            table.specificType('status', 'org_status').defaultTo('active');
            table.jsonb('settings').defaultTo('{}');
            table.timestamps(true, true);
        });
        console.log('✓ Organizations table created successfully');

        console.log('\nStep 3: Creating users table...');
        // Users table - for all portal users
        await knex.schema.createTable('users', (table) => {
            table.increments('id').primary();
            table.string('username').notNullable().unique();
            table.string('password').notNullable();
            table.string('email').notNullable().unique();
            table.specificType('role', 'user_role').notNullable();
            table.integer('organization_id').references('id').inTable('organizations');
            table.boolean('is_active').defaultTo(true);
            table.timestamps(true, true);
        });
        console.log('✓ Users table created successfully');

        console.log('\nStep 4: Creating course types table...');
        // Course types table
        await knex.schema.createTable('course_types', (table) => {
            table.increments('id').primary();
            table.string('name').notNullable();
            table.string('code', 3).notNullable().unique(); // First 3 letters for course number
            table.text('description');
            table.timestamps(true, true);
        });
        console.log('✓ Course types table created successfully');

        console.log('\nStep 5: Creating course instances table...');
        // Course instances table (actual scheduled courses)
        await knex.schema.createTable('course_instances', (table) => {
            table.increments('id').primary();
            table.string('course_number').notNullable().unique(); // yyyy-mm-dd-AAA-BBB
            table.date('requested_date').notNullable();
            table.integer('organization_id').references('id').inTable('organizations');
            table.integer('course_type_id').references('id').inTable('course_types');
            table.integer('instructor_id').references('id').inTable('users');
            table.string('location').notNullable();
            table.integer('max_students');
            table.specificType('status', 'course_status').defaultTo('pending');
            table.text('notes');
            table.timestamps(true, true);
        });
        console.log('✓ Course instances table created successfully');

        console.log('\nStep 6: Creating instructor availability table...');
        // Instructor availability
        await knex.schema.createTable('instructor_availability', (table) => {
            table.increments('id').primary();
            table.integer('instructor_id').references('id').inTable('users').notNullable();
            table.date('date').notNullable();
            table.integer('day_of_week'); // 0-6 for Sunday-Saturday
            table.specificType('status', 'availability_status').defaultTo('available');
            table.timestamps(true, true);
            table.unique(['instructor_id', 'date']);
        });
        console.log('✓ Instructor availability table created successfully');

        console.log('\nStep 7: Creating students table...');
        // Students table
        await knex.schema.createTable('students', (table) => {
            table.increments('id').primary();
            table.string('name').notNullable();
            table.string('email');
            table.integer('organization_id').references('id').inTable('organizations');
            table.timestamps(true, true);
        });
        console.log('✓ Students table created successfully');

        console.log('\nStep 8: Creating student registrations table...');
        // Student registrations table
        await knex.schema.createTable('student_registrations', (table) => {
            table.increments('id').primary();
            table.integer('course_instance_id').references('id').inTable('course_instances').notNullable();
            table.integer('student_id').references('id').inTable('students').notNullable();
            table.date('registration_date').notNullable().defaultTo(knex.fn.now());
            table.boolean('is_confirmed').defaultTo(false);
            table.text('notes');
            table.timestamps(true, true);
            table.unique(['course_instance_id', 'student_id']);
        });
        console.log('✓ Student registrations table created successfully');

        console.log('\nStep 9: Creating student attendance table...');
        // Student attendance table
        await knex.schema.createTable('student_attendance', (table) => {
            table.increments('id').primary();
            table.integer('course_instance_id').references('id').inTable('course_instances').notNullable();
            table.integer('student_id').references('id').inTable('students').notNullable();
            table.boolean('attended').defaultTo(false);
            table.boolean('certification_issued').defaultTo(false);
            table.text('notes');
            table.timestamps(true, true);
            table.unique(['course_instance_id', 'student_id']);
        });
        console.log('✓ Student attendance table created successfully');

        console.log('\nStep 10: Creating indexes...');
        // Create indexes
        await knex.raw('CREATE INDEX IF NOT EXISTS idx_student_registrations_course_instance ON student_registrations(course_instance_id)');
        await knex.raw('CREATE INDEX IF NOT EXISTS idx_student_registrations_student ON student_registrations(student_id)');
        await knex.raw('CREATE INDEX IF NOT EXISTS idx_student_attendance_course_instance ON student_attendance(course_instance_id)');
        await knex.raw('CREATE INDEX IF NOT EXISTS idx_student_attendance_student ON student_attendance(student_id)');
        console.log('✓ Indexes created successfully');

        console.log('\nStep 11: Creating trigger function...');
        // Create trigger function
        await knex.raw(`
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ language 'plpgsql';
        `);
        console.log('✓ Trigger function created successfully');

        console.log('\nStep 12: Creating triggers...');
        // Create triggers
        await knex.raw(`
            CREATE TRIGGER update_student_registrations_updated_at
                BEFORE UPDATE ON student_registrations
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        `);

        await knex.raw(`
            CREATE TRIGGER update_student_attendance_updated_at
                BEFORE UPDATE ON student_attendance
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        `);
        console.log('✓ Triggers created successfully');

        console.log('\n=== Migration Completed Successfully! ===\n');
    } catch (error) {
        console.error('\n=== Migration Failed! ===\n');
        console.error('Error details:', error);
        throw error;
    }
}

export async function down(knex: Knex): Promise<void> {
    console.log('\n=== Starting Rollback ===\n');
    
    try {
        console.log('Step 1: Dropping triggers...');
        // Drop triggers
        await knex.raw('DROP TRIGGER IF EXISTS update_student_registrations_updated_at ON student_registrations');
        await knex.raw('DROP TRIGGER IF EXISTS update_student_attendance_updated_at ON student_attendance');
        console.log('✓ Triggers dropped successfully');

        console.log('\nStep 2: Dropping function...');
        // Drop function
        await knex.raw('DROP FUNCTION IF EXISTS update_updated_at_column');
        console.log('✓ Function dropped successfully');

        console.log('\nStep 3: Dropping indexes...');
        // Drop indexes
        await knex.raw('DROP INDEX IF EXISTS idx_student_registrations_course_instance');
        await knex.raw('DROP INDEX IF EXISTS idx_student_registrations_student');
        await knex.raw('DROP INDEX IF EXISTS idx_student_attendance_course_instance');
        await knex.raw('DROP INDEX IF EXISTS idx_student_attendance_student');
        console.log('✓ Indexes dropped successfully');

        console.log('\nStep 4: Dropping tables...');
        // Drop tables in reverse order
        await knex.schema.dropTableIfExists('student_attendance');
        await knex.schema.dropTableIfExists('student_registrations');
        await knex.schema.dropTableIfExists('students');
        await knex.schema.dropTableIfExists('instructor_availability');
        await knex.schema.dropTableIfExists('course_instances');
        await knex.schema.dropTableIfExists('course_types');
        await knex.schema.dropTableIfExists('users');
        await knex.schema.dropTableIfExists('organizations');
        console.log('✓ Tables dropped successfully');

        console.log('\nStep 5: Dropping enum types...');
        // Drop enum types
        await knex.raw('DROP TYPE IF EXISTS user_role');
        await knex.raw('DROP TYPE IF EXISTS org_status');
        await knex.raw('DROP TYPE IF EXISTS course_status');
        await knex.raw('DROP TYPE IF EXISTS availability_status');
        console.log('✓ Enum types dropped successfully');

        console.log('\n=== Rollback Completed Successfully! ===\n');
    } catch (error) {
        console.error('\n=== Rollback Failed! ===\n');
        console.error('Error details:', error);
        throw error;
    }
} 