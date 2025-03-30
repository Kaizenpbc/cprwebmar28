import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../db';

const router = express.Router();

// Login route
router.post('/login', async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user.id,
                role: user.role,
                email: user.email,
                organizationId: user.organization_id
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                organizationId: user.organization_id
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error during login' });
    }
});

export default router; 