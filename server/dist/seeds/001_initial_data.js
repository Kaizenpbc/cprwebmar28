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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seed = seed;
const bcrypt_1 = __importDefault(require("bcrypt"));
function seed(knex) {
    return __awaiter(this, void 0, void 0, function* () {
        // Clear existing entries
        yield knex('course_attendance').del();
        yield knex('students').del();
        yield knex('instructor_availability').del();
        yield knex('course_instances').del();
        yield knex('course_types').del();
        yield knex('organizations').del();
        yield knex('users').del();
        // Insert organizations
        const [org] = yield knex('organizations').insert([
            {
                name: 'Sample Organization',
                code: 'SAM',
                status: 'active',
                settings: JSON.stringify({
                    billing_address: '123 Main St',
                    phone: '555-0123'
                })
            }
        ]).returning('*');
        // Insert course types
        const courseTypes = yield knex('course_types').insert([
            {
                name: 'Basic Life Support',
                code: 'BLS',
                description: 'Basic Life Support certification course'
            },
            {
                name: 'Advanced Cardiac Life Support',
                code: 'ACL',
                description: 'Advanced Cardiac Life Support certification course'
            },
            {
                name: 'Pediatric Advanced Life Support',
                code: 'PAL',
                description: 'Pediatric Advanced Life Support certification course'
            }
        ]).returning('*');
        // Insert users with hashed passwords
        const saltRounds = 10;
        const hashedPassword = yield bcrypt_1.default.hash('password123', saltRounds);
        const users = yield knex('users').insert([
            {
                username: 'admin',
                password: hashedPassword,
                email: 'admin@example.com',
                role: 'sysAdmin',
                is_active: true
            },
            {
                username: 'instructor1',
                password: hashedPassword,
                email: 'instructor1@example.com',
                role: 'instructor',
                is_active: true
            },
            {
                username: 'orgadmin',
                password: hashedPassword,
                email: 'orgadmin@example.com',
                role: 'orgAdmin',
                is_active: true
            },
            {
                username: 'coursemanager',
                password: hashedPassword,
                email: 'coursemanager@example.com',
                role: 'courseAdmin',
                is_active: true
            },
            {
                username: 'student1',
                password: hashedPassword,
                email: 'student1@example.com',
                role: 'student',
                is_active: true
            }
        ]).returning('*');
        const instructor = users.find(u => u.role === 'instructor');
        if (!instructor) {
            throw new Error('Instructor not found');
        }
        // Create test course instances
        const courseInstances = yield knex('course_instances').insert([
            {
                course_number: '2024-04-01-SAM-BLS',
                requested_date: '2024-04-01',
                organization_id: org.id,
                course_type_id: courseTypes[0].id,
                instructor_id: instructor.id,
                location: 'Room 101',
                max_students: 10,
                status: 'scheduled'
            },
            {
                course_number: '2024-04-15-SAM-ACL',
                requested_date: '2024-04-15',
                organization_id: org.id,
                course_type_id: courseTypes[1].id,
                instructor_id: instructor.id,
                location: 'Room 202',
                max_students: 8,
                status: 'pending'
            }
        ]).returning('*');
        // Create test instructor availability
        yield knex('instructor_availability').insert([
            {
                instructor_id: instructor.id,
                date: '2024-04-01',
                status: 'scheduled'
            },
            {
                instructor_id: instructor.id,
                date: '2024-04-15',
                status: 'available'
            }
        ]);
        // Create test students
        const students = yield knex('students').insert([
            {
                name: 'John Doe',
                email: 'john@example.com',
                organization_id: org.id
            },
            {
                name: 'Jane Smith',
                email: 'jane@example.com',
                organization_id: org.id
            },
            {
                name: 'Bob Wilson',
                email: 'bob@example.com',
                organization_id: org.id
            }
        ]).returning('*');
        // Create test course attendance
        yield knex('course_attendance').insert([
            {
                course_instance_id: courseInstances[0].id,
                student_id: students[0].id,
                attended: true
            },
            {
                course_instance_id: courseInstances[0].id,
                student_id: students[1].id,
                attended: false
            },
            {
                course_instance_id: courseInstances[1].id,
                student_id: students[2].id,
                attended: false
            }
        ]);
    });
}
