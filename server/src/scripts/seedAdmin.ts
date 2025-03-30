import bcrypt from 'bcrypt';
import { pool } from '../db';

async function seedAdmin() {
    try {
        console.log('🌱 Seeding admin user...');

        // Check if admin user already exists
        const adminCheck = await pool.query('SELECT * FROM users WHERE email = $1', ['admin@example.com']);
        
        if (adminCheck.rows.length > 0) {
            console.log('✅ Admin user already exists');
            return;
        }

        // Create admin user
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const result = await pool.query(
            'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING *',
            ['admin@example.com', hashedPassword, 'sysAdmin']
        );

        console.log('✅ Admin user created:', result.rows[0]);
    } catch (error) {
        console.error('❌ Error seeding admin user:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

seedAdmin(); 