import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    // Create payment_status enum type
    await knex.raw(`
        CREATE TYPE payment_status AS ENUM (
            'PENDING',
            'PAID',
            'OVERDUE',
            'CANCELLED',
            'REFUNDED'
        );
    `);

    // Create payment_method enum type
    await knex.raw(`
        CREATE TYPE payment_method AS ENUM (
            'CREDIT_CARD',
            'BANK_TRANSFER',
            'CHECK',
            'CASH',
            'OTHER'
        );
    `);

    // Create course_payments table
    await knex.schema.createTable('course_payments', (table) => {
        table.increments('id').primary();
        table.integer('course_instance_id').notNullable()
            .references('id').inTable('course_instances')
            .onDelete('CASCADE');
        table.integer('organization_id').notNullable()
            .references('id').inTable('organizations')
            .onDelete('CASCADE');
        table.decimal('amount', 10, 2).notNullable();
        table.specificType('payment_method', 'payment_method').notNullable();
        table.specificType('status', 'payment_status').notNullable();
        table.integer('recorded_by').notNullable()
            .references('id').inTable('users')
            .onDelete('SET NULL');
        table.text('notes');
        table.timestamps(true, true);
    });

    // Create financial_records table
    await knex.schema.createTable('financial_records', (table) => {
        table.increments('id').primary();
        table.integer('organization_id').notNullable()
            .references('id').inTable('organizations')
            .onDelete('CASCADE');
        table.decimal('amount', 10, 2).notNullable();
        table.string('type').notNullable();
        table.integer('reference_id');
        table.text('description');
        table.timestamps(true, true);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('financial_records');
    await knex.schema.dropTableIfExists('course_payments');
    await knex.raw('DROP TYPE IF EXISTS payment_method');
    await knex.raw('DROP TYPE IF EXISTS payment_status');
} 