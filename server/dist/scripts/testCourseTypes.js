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
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const API_URL = process.env.API_URL || 'http://localhost:9005';
function testCourseTypes() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Login as sysAdmin
            console.log('Logging in as sysAdmin...');
            const loginResponse = yield axios_1.default.post(`${API_URL}/auth/login`, {
                email: 'admin@example.com',
                password: 'password123'
            });
            const token = loginResponse.data.token;
            const headers = { Authorization: `Bearer ${token}` };
            // Create a new course type
            console.log('\nCreating new course type...');
            const createResponse = yield axios_1.default.post(`${API_URL}/api/course-types`, {
                name: 'Test Course',
                code: 'TST',
                description: 'A test course type'
            }, { headers });
            console.log('Created course type:', createResponse.data);
            const courseTypeId = createResponse.data.id;
            // Get all course types
            console.log('\nFetching all course types...');
            const getAllResponse = yield axios_1.default.get(`${API_URL}/api/course-types`, { headers });
            console.log('All course types:', getAllResponse.data);
            // Get course type by ID
            console.log('\nFetching course type by ID...');
            const getOneResponse = yield axios_1.default.get(`${API_URL}/api/course-types/${courseTypeId}`, { headers });
            console.log('Single course type:', getOneResponse.data);
            // Update course type
            console.log('\nUpdating course type...');
            const updateResponse = yield axios_1.default.put(`${API_URL}/api/course-types/${courseTypeId}`, {
                name: 'Updated Test Course',
                code: 'UTS',
                description: 'An updated test course type'
            }, { headers });
            console.log('Updated course type:', updateResponse.data);
            // Delete course type
            console.log('\nDeleting course type...');
            const deleteResponse = yield axios_1.default.delete(`${API_URL}/api/course-types/${courseTypeId}`, { headers });
            console.log('Delete response:', deleteResponse.data);
            console.log('\nAll tests completed successfully!');
        }
        catch (error) {
            const err = error;
            console.error('Test failed:', {
                message: err.message,
                details: err
            });
        }
    });
}
testCourseTypes();
