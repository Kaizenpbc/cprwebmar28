import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Add missing columns to course_instances
  await knex.schema.alterTable('course_instances', (table) => {
    table.timestamp('start_time').nullable();
    table.text('notes').nullable();
  });

  // Create courses table
  await knex.schema.createTable('courses', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.text('description');
    table.integer('duration_minutes').notNullable();
    table.decimal('price', 10, 2).notNullable();
    table.integer('organization_id').references('id').inTable('organizations').notNullable();
    table.timestamps(true, true);
  });

  // Update student_attendance table
  await knex.schema.alterTable('student_attendance', (table) => {
    table.dropColumn('attended');
    table.dropColumn('certification_issued');
    table.enum('status', ['PRESENT', 'ABSENT', 'LATE']).notNullable();
    table.boolean('certification_issued').defaultTo(false);
  });
}

export async function down(knex: Knex): Promise<void> {
  // Remove added columns from course_instances
  await knex.schema.alterTable('course_instances', (table) => {
    table.dropColumn('start_time');
    table.dropColumn('notes');
  });

  // Drop courses table
  await knex.schema.dropTableIfExists('courses');

  // Revert student_attendance table
  await knex.schema.alterTable('student_attendance', (table) => {
    table.dropColumn('status');
    table.dropColumn('certification_issued');
    table.boolean('attended').defaultTo(false);
    table.boolean('certification_issued').defaultTo(false);
  });
} 