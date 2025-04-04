import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create the migrations table if it doesn't exist
  await knex.schema.createTableIfNotExists('knex_migrations', (table) => {
    table.increments();
    table.string('name');
    table.integer('batch');
    table.timestamp('migration_time').defaultTo(knex.fn.now());
  });

  // Create the migrations lock table if it doesn't exist
  await knex.schema.createTableIfNotExists('knex_migrations_lock', (table) => {
    table.integer('index').primary();
    table.integer('is_locked');
  });

  // Insert initial lock record if it doesn't exist
  await knex('knex_migrations_lock')
    .insert({ index: 1, is_locked: 0 })
    .onConflict('index')
    .ignore();
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('knex_migrations');
  await knex.schema.dropTableIfExists('knex_migrations_lock');
} 