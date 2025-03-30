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
function testInstructorEndpoints() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('🏃 Starting instructor endpoints test...\n');
            // Login as instructor
            console.log('1️⃣ Authenticating as instructor...');
            try {
                console.log('Sending authentication request to:', `${API_URL}/auth/login`);
                const authResponse = yield axios_1.default.post(`${API_URL}/auth/login`, {
                    email: 'instructor1@example.com',
                    password: 'password123'
                });
                authToken = authResponse.data.token;
                console.log('✅ Authentication successful\n');
            }
            catch (error) {
                console.error('Authentication failed:');
                if (error.response) {
                    console.error('Response status:', error.response.status);
                    console.error('Response data:', error.response.data);
                }
                throw error;
            }
            // Test GET instructor's availability
            console.log('2️⃣ Testing GET instructor availability:');
            try {
                const availabilityResponse = yield axios_1.default.get(`${API_URL}/instructors/availability/2`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                console.log('✅ Availability retrieved successfully');
                console.log('Availability count:', availabilityResponse.data.length);
                console.log('Sample availability:', availabilityResponse.data[0], '\n');
            }
            catch (error) {
                console.error('GET availability failed:');
                if (error.response) {
                    console.error('Response status:', error.response.status);
                    console.error('Response data:', error.response.data);
                }
                throw error;
            }
            // Test POST instructor's availability
            console.log('3️⃣ Testing POST instructor availability:');
            const newAvailability = {
                date: '2024-05-01',
                status: 'available'
            };
            try {
                const createResponse = yield axios_1.default.post(`${API_URL}/instructors/availability`, newAvailability, { headers: { Authorization: `Bearer ${authToken}` } });
                console.log('✅ Availability created successfully');
                console.log('Created availability:', createResponse.data, '\n');
            }
            catch (error) {
                console.error('POST availability failed:');
                if (error.response) {
                    console.error('Response status:', error.response.status);
                    console.error('Response data:', error.response.data);
                }
                throw error;
            }
            // Test GET instructor's courses
            console.log('4️⃣ Testing GET instructor courses:');
            try {
                const coursesResponse = yield axios_1.default.get(`${API_URL}/instructors/courses/2`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                console.log('✅ Courses retrieved successfully');
                console.log('Courses count:', coursesResponse.data.length);
                console.log('Sample course:', coursesResponse.data[0], '\n');
                if (coursesResponse.data.length > 0) {
                    // Test PUT course status update
                    console.log('5️⃣ Testing PUT course status update:');
                    const updateData = {
                        status: 'completed'
                    };
                    const updateResponse = yield axios_1.default.put(`${API_URL}/instructors/courses/${coursesResponse.data[0].id}`, updateData, { headers: { Authorization: `Bearer ${authToken}` } });
                    console.log('✅ Course status updated successfully');
                    console.log('Updated course:', updateResponse.data, '\n');
                }
            }
            catch (error) {
                console.error('Course operation failed:');
                if (error.response) {
                    console.error('Response status:', error.response.status);
                    console.error('Response data:', error.response.data);
                }
                throw error;
            }
            console.log('🎉 All instructor tests completed successfully!');
        }
        catch (error) {
            console.error('\n❌ Test failed');
            process.exit(1);
        }
    });
}
testInstructorEndpoints();
