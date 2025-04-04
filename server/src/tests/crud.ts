import { db } from '../config/db';
import { Knex } from 'knex';

interface TestRecord {
    id?: number;
    name: string;
    email: string;
    created_at?: Date;
}

async function setupTestTable() {
    try {
        // Drop test table if exists
        await db.raw(`DROP TABLE IF EXISTS test_crud`);
        
        // Create test table
        await db.raw(`
            CREATE TABLE test_crud (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        console.log('Test table created successfully');
    } catch (error) {
        console.error('Error setting up test table:', error);
        throw error;
    }
}

async function runCRUDTests() {
    console.log('Starting CRUD tests...');
    
    try {
        // Setup
        await setupTestTable();
        
        // CREATE Test
        console.log('\nTesting CREATE...');
        const insertResult = await db('test_crud').insert({
            name: 'Test User',
            email: 'test@example.com'
        }).returning('*');
        console.log('Create result:', insertResult[0]);
        
        // READ Test
        console.log('\nTesting READ...');
        const readResult = await db('test_crud')
            .where({ email: 'test@example.com' })
            .first();
        console.log('Read result:', readResult);
        
        // UPDATE Test
        console.log('\nTesting UPDATE...');
        const updateResult = await db('test_crud')
            .where({ id: readResult.id })
            .update({ name: 'Updated User' })
            .returning('*');
        console.log('Update result:', updateResult[0]);
        
        // Transaction Test
        console.log('\nTesting Transaction...');
        await db.transaction(async (trx: Knex.Transaction) => {
            const transactionResult = await trx('test_crud')
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
        }).catch((error: Error) => {
            console.error('Transaction failed:', error);
        });
        
        // DELETE Test
        console.log('\nTesting DELETE...');
        const deleteResult = await db('test_crud')
            .where({ id: readResult.id })
            .delete();
        console.log('Delete result:', deleteResult);
        
        // Verify table is empty
        const finalCount = await db('test_crud').count('* as count').first();
        console.log('\nFinal record count:', finalCount);
        
        console.log('\nAll CRUD tests completed successfully!');
    } catch (error) {
        console.error('Test failed:', error);
        throw error;
    } finally {
        // Cleanup
        await db.raw('DROP TABLE IF EXISTS test_crud');
        console.log('\nTest table cleaned up');
    }
}

// Run the CRUD tests
runCRUDTests().catch(console.error); 