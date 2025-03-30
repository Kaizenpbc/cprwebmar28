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
function testAvailability() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('🏃 Testing instructor availability scheduling...\n');
            // 1. Login as instructor
            console.log('1️⃣ Logging in as instructor...');
            const authResponse = yield axios_1.default.post(`${API_URL}/auth/login`, {
                email: 'instructor1@example.com',
                password: 'password123'
            });
            authToken = authResponse.data.token;
            console.log('✅ Login successful!\n');
            // 2. Schedule availability for April 1st
            console.log('2️⃣ Scheduling availability for April 1st...');
            const availabilityResponse = yield axios_1.default.post(`${API_URL}/instructors/availability`, {
                date: '2024-04-01',
                status: 'available'
            }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            console.log('✅ Availability scheduled!\n');
            console.log('Scheduled availability:', availabilityResponse.data);
            // 3. Verify by getting all availability
            console.log('\n3️⃣ Verifying instructor availability...');
            const allAvailability = yield axios_1.default.get(`${API_URL}/instructors/availability/2`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            console.log('\nAll availability records:');
            console.log(JSON.stringify(allAvailability.data, null, 2));
        }
        catch (error) {
            console.error('\n❌ Test failed');
            if (error.response) {
                console.error('Status:', error.response.status);
                console.error('Error:', error.response.data);
            }
            else {
                console.error('Error:', error.message);
            }
            process.exit(1);
        }
    });
}
testAvailability();
