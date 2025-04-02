import bcrypt from 'bcrypt';
import { pool } from '../config/db';

async function seedTestUsers() {
    try {
        console.log('🌱 Seeding test users...');

        // Test users data
        const testUsers = [
            {
                email: 'admin@example.com',
                password: 'admin123',
                role: 'admin'
            },
            {
                email: 'instructor@example.com',
                password: 'instructor123',
                role: 'instructor'
            },
            {
                email: 'student@example.com',
                password: 'student123',
                role: 'student'
            }
        ];

        for (const user of testUsers) {
            // Check if user already exists
            const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [user.email]);
            
            if (userCheck.rows.length > 0) {
                console.log(`✅ User ${user.email} already exists`);
                continue;
            }

            // Create user
            const hashedPassword = await bcrypt.hash(user.password, 10);
            const result = await pool.query(
                'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING *',
                [user.email, hashedPassword, user.role]
            );

            console.log(`✅ User created:`, result.rows[0]);
        }

        console.log('✅ All test users seeded successfully');
    } catch (error) {
        console.error('❌ Error seeding test users:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

seedTestUsers(); 