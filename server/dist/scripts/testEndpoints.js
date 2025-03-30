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
const API_URL = 'http://localhost:9005';
let authToken;
function testEndpoints() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            console.log('🏃 Starting API endpoint tests...\n');
            // Test authentication
            console.log('1️⃣ Testing Authentication:');
            const authResponse = yield axios_1.default.post(`${API_URL}/auth/login`, {
                email: 'admin@example.com',
                password: 'password123'
            });
            authToken = authResponse.data.token;
            console.log('✅ Authentication successful');
            console.log('Token received:', (authToken === null || authToken === void 0 ? void 0 : authToken.substring(0, 20)) + '...\n');
            // Test GET users endpoint
            console.log('2️⃣ Testing Users Endpoint:');
            const usersResponse = yield axios_1.default.get(`${API_URL}/users`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            console.log('✅ Users retrieved successfully');
            console.log('Users count:', usersResponse.data.length);
            console.log('Sample user:', usersResponse.data[0], '\n');
            // Test GET organizations endpoint
            console.log('3️⃣ Testing Organizations Endpoint:');
            const orgsResponse = yield axios_1.default.get(`${API_URL}/organizations`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            console.log('✅ Organizations retrieved successfully');
            console.log('Organizations count:', orgsResponse.data.length);
            console.log('Sample organization:', orgsResponse.data[0], '\n');
            // Test GET course-types endpoint
            console.log('4️⃣ Testing Course Types Endpoint:');
            const courseTypesResponse = yield axios_1.default.get(`${API_URL}/course-types`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            console.log('✅ Course types retrieved successfully');
            console.log('Course types count:', courseTypesResponse.data.length);
            console.log('Sample course type:', courseTypesResponse.data[0], '\n');
            // Test GET course-instances endpoint
            console.log('5️⃣ Testing Course Instances Endpoint:');
            const coursesResponse = yield axios_1.default.get(`${API_URL}/course-instances`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            console.log('✅ Course instances retrieved successfully');
            console.log('Course instances count:', coursesResponse.data.length);
            console.log('Sample course instance:', coursesResponse.data[0], '\n');
            // Test GET students endpoint
            console.log('6️⃣ Testing Students Endpoint:');
            const studentsResponse = yield axios_1.default.get(`${API_URL}/students`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            console.log('✅ Students retrieved successfully');
            console.log('Students count:', studentsResponse.data.length);
            console.log('Sample student:', studentsResponse.data[0], '\n');
            console.log('🎉 All endpoint tests completed successfully!');
        }
        catch (error) {
            console.error('❌ Error during testing:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
            if (error.response) {
                console.error('Status:', error.response.status);
                console.error('Data:', error.response.data);
            }
        }
    });
}
testEndpoints();
