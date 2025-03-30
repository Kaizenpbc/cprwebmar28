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
        // Create enum types first
        yield knex.raw(`
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
        yield knex.schema.createTable('users', (table) => {
            table.increments('id').primary();
            table.string('username').notNullable().unique();
            table.string('password').notNullable();
            table.string('email').notNullable().unique();
            table.specificType('role', 'user_role').notNullable();
            table.boolean('is_active').defaultTo(true);
            table.timestamps(true, true);
        });
        // Organizations table
        yield knex.schema.createTable('organizations', (table) => {
            table.increments('id').primary();
            table.string('name').notNullable();
            table.string('code', 3).notNullable().unique(); // First 3 letters for course number
            table.specificType('status', 'org_status').defaultTo('active');
            table.jsonb('settings').defaultTo('{}');
            table.timestamps(true, true);
        });
        // Course types table
        yield knex.schema.createTable('course_types', (table) => {
            table.increments('id').primary();
            table.string('name').notNullable();
            table.string('code', 3).notNullable().unique(); // First 3 letters for course number
            table.text('description');
            table.timestamps(true, true);
        });
        // Course instances table (actual scheduled courses)
        yield knex.schema.createTable('course_instances', (table) => {
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
        yield knex.schema.createTable('instructor_availability', (table) => {
            table.increments('id').primary();
            table.integer('instructor_id').references('id').inTable('users').notNullable();
            table.date('date').notNullable();
            table.specificType('status', 'availability_status').defaultTo('available');
            table.timestamps(true, true);
            table.unique(['instructor_id', 'date']);
        });
        // Students table
        yield knex.schema.createTable('students', (table) => {
            table.increments('id').primary();
            table.string('name').notNullable();
            table.string('email');
            table.integer('organization_id').references('id').inTable('organizations');
            table.timestamps(true, true);
        });
        // Course attendance
        yield knex.schema.createTable('course_attendance', (table) => {
            table.increments('id').primary();
            table.integer('course_instance_id').references('id').inTable('course_instances').notNullable();
            table.integer('student_id').references('id').inTable('students').notNullable();
            table.boolean('attended').defaultTo(false);
            table.text('notes');
            table.timestamps(true, true);
            table.unique(['course_instance_id', 'student_id']);
        });
    });
}
function down(knex) {
    return __awaiter(this, void 0, void 0, function* () {
        yield knex.schema.dropTableIfExists('course_attendance');
        yield knex.schema.dropTableIfExists('students');
        yield knex.schema.dropTableIfExists('instructor_availability');
        yield knex.schema.dropTableIfExists('course_instances');
        yield knex.schema.dropTableIfExists('course_types');
        yield knex.schema.dropTableIfExists('organizations');
        yield knex.schema.dropTableIfExists('users');
        yield knex.raw(`
        DROP TYPE IF EXISTS user_role;
        DROP TYPE IF EXISTS org_status;
        DROP TYPE IF EXISTS course_status;
        DROP TYPE IF EXISTS availability_status;
    `);
    });
}
