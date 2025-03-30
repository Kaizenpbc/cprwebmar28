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
const knex_1 = require("knex");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const db = (0, knex_1.knex)({
    client: 'pg',
    connection: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'gtacpr',
        database: process.env.DB_NAME || 'educational_system'
    }
});
function verifyData() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('Verifying Users:');
            const users = yield db('users').select('username', 'email', 'role');
            console.log(users);
            console.log('\nVerifying Organizations:');
            const organizations = yield db('organizations').select('name', 'code', 'status');
            console.log(organizations);
            console.log('\nVerifying Course Types:');
            const courseTypes = yield db('course_types').select('name', 'code', 'description');
            console.log(courseTypes);
            console.log('\nVerifying Course Instances:');
            const courseInstances = yield db('course_instances')
                .select('course_number', 'requested_date', 'location', 'status');
            console.log(courseInstances);
            console.log('\nVerifying Students:');
            const students = yield db('students').select('name', 'email');
            console.log(students);
            console.log('\nVerifying Course Attendance:');
            const attendance = yield db('course_attendance').select('*');
            console.log(attendance);
        }
        catch (error) {
            console.error('Error verifying data:', error);
        }
        finally {
            yield db.destroy();
        }
    });
}
verifyData();
