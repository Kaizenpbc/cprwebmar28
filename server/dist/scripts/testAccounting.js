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
function testAccounting() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Login as accounting user
            console.log('Logging in as accounting user...');
            const loginResponse = yield axios_1.default.post(`${API_URL}/auth/login`, {
                email: 'accounting@example.com',
                password: 'password123'
            });
            const token = loginResponse.data.token;
            const headers = { Authorization: `Bearer ${token}` };
            // Record a course payment
            console.log('\nRecording a course payment...');
            const paymentData = {
                amount: 500.00,
                payment_method: 'CREDIT_CARD',
                status: 'PAID'
            };
            const createResponse = yield axios_1.default.post(`${API_URL}/api/accounting/course/1/payment`, paymentData, { headers });
            console.log('Created payment:', createResponse.data);
            // Get payment status
            console.log('\nFetching payment status...');
            const paymentResponse = yield axios_1.default.get(`${API_URL}/api/accounting/course/1/payment`, { headers });
            console.log('Payment status:', paymentResponse.data);
            // Get all financial records
            console.log('\nFetching all financial records...');
            const recordsResponse = yield axios_1.default.get(`${API_URL}/api/accounting`, { headers });
            console.log('Financial records:', recordsResponse.data);
            // Get organization financial records
            console.log('\nFetching organization financial records...');
            const orgRecordsResponse = yield axios_1.default.get(`${API_URL}/api/accounting/organization/1`, { headers });
            console.log('Organization records:', orgRecordsResponse.data);
            // Get financial summary
            console.log('\nFetching financial summary...');
            const today = new Date().toISOString().split('T')[0];
            const summaryResponse = yield axios_1.default.get(`${API_URL}/api/accounting/summary`, {
                headers,
                params: {
                    start_date: '2024-01-01',
                    end_date: today
                }
            });
            console.log('Financial summary:', summaryResponse.data);
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
testAccounting();
