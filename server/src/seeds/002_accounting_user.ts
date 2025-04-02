import { Knex } from 'knex';
import bcrypt from 'bcryptjs';

export async function seed(knex: Knex): Promise<void> {
    // Add accounting user
    await knex('users').insert({
        username: 'accounting',
        email: 'accounting@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'orgAdmin',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
    });
} 