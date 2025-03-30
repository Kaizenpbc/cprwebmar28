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
const db_1 = __importDefault(require("../config/db"));
const BASE_URL = 'http://localhost:9005';
const NUM_REQUESTS = 100;
const CONCURRENT_USERS = 10;
function simulateUserLoad() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const startTime = Date.now();
            const response = yield axios_1.default.get(`${BASE_URL}/api/health`);
            const endTime = Date.now();
            return {
                success: response.status === 200,
                latency: endTime - startTime
            };
        }
        catch (error) {
            return {
                success: false,
                latency: 0,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    });
}
function databaseStressTest() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const startTime = Date.now();
            yield db_1.default.raw('SELECT pg_sleep(0.1)'); // Simulate complex query
            const endTime = Date.now();
            return {
                success: true,
                latency: endTime - startTime
            };
        }
        catch (error) {
            return {
                success: false,
                latency: 0,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    });
}
function runStressTest() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Starting stress test...');
        console.log(`Concurrent users: ${CONCURRENT_USERS}`);
        console.log(`Requests per user: ${NUM_REQUESTS}`);
        const results = {
            api: {
                success: 0,
                failed: 0,
                totalLatency: 0,
                maxLatency: 0,
                minLatency: Number.MAX_VALUE
            },
            database: {
                success: 0,
                failed: 0,
                totalLatency: 0,
                maxLatency: 0,
                minLatency: Number.MAX_VALUE
            }
        };
        // API stress test
        const apiPromises = Array(CONCURRENT_USERS).fill(null).map(() => __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < NUM_REQUESTS; i++) {
                const result = yield simulateUserLoad();
                if (result.success) {
                    results.api.success++;
                    results.api.totalLatency += result.latency;
                    results.api.maxLatency = Math.max(results.api.maxLatency, result.latency);
                    results.api.minLatency = Math.min(results.api.minLatency, result.latency);
                }
                else {
                    results.api.failed++;
                }
            }
        }));
        // Database stress test
        const dbPromises = Array(CONCURRENT_USERS).fill(null).map(() => __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < NUM_REQUESTS; i++) {
                const result = yield databaseStressTest();
                if (result.success) {
                    results.database.success++;
                    results.database.totalLatency += result.latency;
                    results.database.maxLatency = Math.max(results.database.maxLatency, result.latency);
                    results.database.minLatency = Math.min(results.database.minLatency, result.latency);
                }
                else {
                    results.database.failed++;
                }
            }
        }));
        yield Promise.all([...apiPromises, ...dbPromises]);
        // Print results
        console.log('\nTest Results:');
        console.log('\nAPI Performance:');
        console.log(`Success: ${results.api.success}`);
        console.log(`Failed: ${results.api.failed}`);
        console.log(`Average Latency: ${results.api.totalLatency / results.api.success}ms`);
        console.log(`Max Latency: ${results.api.maxLatency}ms`);
        console.log(`Min Latency: ${results.api.minLatency}ms`);
        console.log('\nDatabase Performance:');
        console.log(`Success: ${results.database.success}`);
        console.log(`Failed: ${results.database.failed}`);
        console.log(`Average Latency: ${results.database.totalLatency / results.database.success}ms`);
        console.log(`Max Latency: ${results.database.maxLatency}ms`);
        console.log(`Min Latency: ${results.database.minLatency}ms`);
    });
}
// Run the stress test
runStressTest().catch(console.error);
