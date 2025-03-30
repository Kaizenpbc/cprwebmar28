"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
function up(knex) {
    return __awaiter(this, void 0, void 0, function* () {
        // Create payment_status enum type
        yield knex.raw(`
        CREATE TYPE payment_status AS ENUM (
            'PENDING',
            'PAID',
            'OVERDUE',
            'CANCELLED',
            'REFUNDED'
        );
    `);
        // Create payment_method enum type
        yield knex.raw(`
        CREATE TYPE payment_method AS ENUM (
            'CREDIT_CARD',
            'BANK_TRANSFER',
            'CHECK',
            'CASH',
            'OTHER'
        );
    `);
        // Create course_payments table
        yield knex.schema.createTable('course_payments', (table) => {
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
        yield knex.schema.createTable('financial_records', (table) => {
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
    });
}
function down(knex) {
    return __awaiter(this, void 0, void 0, function* () {
        yield knex.schema.dropTableIfExists('financial_records');
        yield knex.schema.dropTableIfExists('course_payments');
        yield knex.raw('DROP TYPE IF EXISTS payment_method');
        yield knex.raw('DROP TYPE IF EXISTS payment_status');
    });
}
