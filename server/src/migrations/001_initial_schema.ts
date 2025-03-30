import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
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

    // Users table - for all portal users
    await knex.schema.createTable('users', (table) => {
        table.increments('id').primary();
        table.string('username').notNullable().unique();
        table.string('password').notNullable();
        table.string('email').notNullable().unique();
        table.specificType('role', 'user_role').notNullable();
        table.boolean('is_active').defaultTo(true);
        table.timestamps(true, true);
    });

    // Organizations table
    await knex.schema.createTable('organizations', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('code', 3).notNullable().unique(); // First 3 letters for course number
        table.specificType('status', 'org_status').defaultTo('active');
        table.jsonb('settings').defaultTo('{}');
        table.timestamps(true, true);
    });

    // Course types table
    await knex.schema.createTable('course_types', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('code', 3).notNullable().unique(); // First 3 letters for course number
        table.text('description');
        table.timestamps(true, true);
    });

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

    // Instructor availability
    await knex.schema.createTable('instructor_availability', (table) => {
        table.increments('id').primary();
        table.integer('instructor_id').references('id').inTable('users').notNullable();
        table.date('date').notNullable();
        table.specificType('status', 'availability_status').defaultTo('available');
        table.timestamps(true, true);
        table.unique(['instructor_id', 'date']);
    });

    // Students table
    await knex.schema.createTable('students', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('email');
        table.integer('organization_id').references('id').inTable('organizations');
        table.timestamps(true, true);
    });

    // Course attendance
    await knex.schema.createTable('course_attendance', (table) => {
        table.increments('id').primary();
        table.integer('course_instance_id').references('id').inTable('course_instances').notNullable();
        table.integer('student_id').references('id').inTable('students').notNullable();
        table.boolean('attended').defaultTo(false);
        table.text('notes');
        table.timestamps(true, true);
        table.unique(['course_instance_id', 'student_id']);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('course_attendance');
    await knex.schema.dropTableIfExists('students');
    await knex.schema.dropTableIfExists('instructor_availability');
    await knex.schema.dropTableIfExists('course_instances');
    await knex.schema.dropTableIfExists('course_types');
    await knex.schema.dropTableIfExists('organizations');
    await knex.schema.dropTableIfExists('users');

    await knex.raw(`
        DROP TYPE IF EXISTS user_role;
        DROP TYPE IF EXISTS org_status;
        DROP TYPE IF EXISTS course_status;
        DROP TYPE IF EXISTS availability_status;
    `);
} 