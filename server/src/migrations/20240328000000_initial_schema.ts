import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create organizations table
  await knex.schema.createTable('organizations', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.timestamps(true, true);
  });

  // Create users table
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('username').notNullable();
    table.string('email').notNullable().unique();
    table.string('password').notNullable();
    table.enum('role', ['sysAdmin', 'orgAdmin', 'courseAdmin', 'instructor', 'student']).notNullable();
    table.integer('organization_id').references('id').inTable('organizations');
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  // Create course_types table
  await knex.schema.createTable('course_types', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.text('description');
    table.integer('duration_minutes').notNullable();
    table.decimal('price', 10, 2).notNullable();
    table.integer('organization_id').references('id').inTable('organizations').notNullable();
    table.timestamps(true, true);
  });

  // Create course_instances table
  await knex.schema.createTable('course_instances', (table) => {
    table.increments('id').primary();
    table.string('course_number').notNullable();
    table.date('requested_date').notNullable();
    table.integer('organization_id').references('id').inTable('organizations').notNullable();
    table.integer('course_type_id').references('id').inTable('course_types').notNullable();
    table.integer('instructor_id').references('id').inTable('users').notNullable();
    table.string('location');
    table.integer('max_students').notNullable();
    table.enum('status', ['pending', 'scheduled', 'in_progress', 'completed', 'cancelled']).defaultTo('pending');
    table.timestamps(true, true);
  });

  // Create instructor_availability table
  await knex.schema.createTable('instructor_availability', (table) => {
    table.increments('id').primary();
    table.integer('instructor_id').references('id').inTable('users').notNullable();
    table.date('date').notNullable();
    table.enum('status', ['available', 'scheduled', 'unavailable']).defaultTo('available');
    table.timestamps(true, true);
  });

  // Create students table
  await knex.schema.createTable('students', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('email').notNullable();
    table.integer('organization_id').references('id').inTable('organizations').notNullable();
    table.timestamps(true, true);
  });

  // Create student_attendance table
  await knex.schema.createTable('student_attendance', (table) => {
    table.increments('id').primary();
    table.integer('course_instance_id').references('id').inTable('course_instances').notNullable();
    table.integer('student_id').references('id').inTable('students').notNullable();
    table.boolean('attended').defaultTo(false);
    table.boolean('certification_issued').defaultTo(false);
    table.timestamps(true, true);
  });

  // Create student_registrations table
  await knex.schema.createTable('student_registrations', (table) => {
    table.increments('id').primary();
    table.integer('course_instance_id').references('id').inTable('course_instances').notNullable();
    table.integer('student_id').references('id').inTable('students').notNullable();
    table.dateTime('registration_date').notNullable();
    table.boolean('is_confirmed').defaultTo(false);
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('student_registrations');
  await knex.schema.dropTableIfExists('student_attendance');
  await knex.schema.dropTableIfExists('students');
  await knex.schema.dropTableIfExists('instructor_availability');
  await knex.schema.dropTableIfExists('course_instances');
  await knex.schema.dropTableIfExists('course_types');
  await knex.schema.dropTableIfExists('users');
  await knex.schema.dropTableIfExists('organizations');
} 