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
function testAuth() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            console.log('Testing authentication endpoint...');
            // Test with valid credentials
            console.log('\n1. Testing with valid credentials:');
            const validResponse = yield axios_1.default.post('http://localhost:9005/auth/login', {
                email: 'admin@example.com',
                password: 'password123'
            });
            console.log('✅ Success! Token received:', validResponse.data.token.substring(0, 20) + '...');
            // Test with invalid credentials
            console.log('\n2. Testing with invalid credentials:');
            try {
                yield axios_1.default.post('http://localhost:9005/auth/login', {
                    email: 'wrong@example.com',
                    password: 'wrongpassword'
                });
            }
            catch (error) {
                if (((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 401) {
                    console.log('✅ Success! Correctly rejected invalid credentials');
                }
                else {
                    throw error;
                }
            }
            console.log('\n✨ All authentication tests passed!');
        }
        catch (error) {
            console.error('\n❌ Test failed:', ((_b = error.response) === null || _b === void 0 ? void 0 : _b.data) || error.message);
            if (error.response) {
                console.error('Status:', error.response.status);
                console.error('Data:', error.response.data);
            }
        }
    });
}
testAuth();
