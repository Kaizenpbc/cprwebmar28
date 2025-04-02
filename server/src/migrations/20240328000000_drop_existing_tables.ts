import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw('DROP TABLE IF EXISTS student_attendance CASCADE');
  await knex.raw('DROP TABLE IF EXISTS student_registrations CASCADE');
  await knex.raw('DROP TABLE IF EXISTS students CASCADE');
  await knex.raw('DROP TABLE IF EXISTS course_instances CASCADE');
  await knex.raw('DROP TABLE IF EXISTS course_types CASCADE');
  await knex.raw('DROP TABLE IF EXISTS instructor_availability CASCADE');
  await knex.raw('DROP TABLE IF EXISTS users CASCADE');
  await knex.raw('DROP TABLE IF EXISTS organizations CASCADE');
  await knex.raw('DROP TYPE IF EXISTS user_role CASCADE');
}

export async function down(_knex: Knex): Promise<void> {
  // No down migration needed as this is a cleanup migration
} 