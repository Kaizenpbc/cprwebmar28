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
const db_1 = __importDefault(require("../config/db"));
function setupTestTable() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Drop test table if exists
            yield db_1.default.raw(`DROP TABLE IF EXISTS test_crud`);
            // Create test table
            yield db_1.default.raw(`
            CREATE TABLE test_crud (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
            console.log('Test table created successfully');
        }
        catch (error) {
            console.error('Error setting up test table:', error);
            throw error;
        }
    });
}
function runCRUDTests() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Starting CRUD tests...');
        try {
            // Setup
            yield setupTestTable();
            // CREATE Test
            console.log('\nTesting CREATE...');
            const insertResult = yield (0, db_1.default)('test_crud').insert({
                name: 'Test User',
                email: 'test@example.com'
            }).returning('*');
            console.log('Create result:', insertResult[0]);
            // READ Test
            console.log('\nTesting READ...');
            const readResult = yield (0, db_1.default)('test_crud')
                .where({ email: 'test@example.com' })
                .first();
            console.log('Read result:', readResult);
            // UPDATE Test
            console.log('\nTesting UPDATE...');
            const updateResult = yield (0, db_1.default)('test_crud')
                .where({ id: readResult.id })
                .update({ name: 'Updated User' })
                .returning('*');
            console.log('Update result:', updateResult[0]);
            // Transaction Test
            console.log('\nTesting Transaction...');
            yield db_1.default.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const transactionResult = yield trx('test_crud')
                    .insert({
                    name: 'Transaction User',
                    email: 'transaction@example.com'
                })
                    .returning('*');
                console.log('Transaction insert:', transactionResult[0]);
                // Simulate a condition that would cause rollback
                if (transactionResult[0].id % 2 === 0) {
                    throw new Error('Simulated error for odd IDs');
                }
            })).catch(error => {
                console.log('Transaction rolled back as expected:', error.message);
            });
            // DELETE Test
            console.log('\nTesting DELETE...');
            const deleteResult = yield (0, db_1.default)('test_crud')
                .where({ id: readResult.id })
                .delete();
            console.log('Delete result:', deleteResult);
            // Verify table is empty
            const finalCount = yield (0, db_1.default)('test_crud').count('* as count').first();
            console.log('\nFinal record count:', finalCount);
            console.log('\nAll CRUD tests completed successfully!');
        }
        catch (error) {
            console.error('Error during CRUD tests:', error);
            throw error;
        }
        finally {
            // Cleanup
            yield db_1.default.raw('DROP TABLE IF EXISTS test_crud');
            console.log('\nTest table cleaned up');
        }
    });
}
// Run the CRUD tests
runCRUDTests().catch(console.error);
