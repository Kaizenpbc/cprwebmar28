import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Login route
router.post('/login', async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, portal } = req.body;

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

        // Check if user's role matches the portal
        if (user.role !== portal) {
            res.status(401).json({ message: 'Invalid portal for this user' });
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
            process.env.JWT_SECRET || 'cpr_secret_key_2024',
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

// Verify token route
router.get('/verify', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        // Get user details from database
        const result = await pool.query('SELECT id, email, role, organization_id FROM users WHERE id = $1', [req.user.userId]);
        const user = result.rows[0];

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.json({
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                organizationId: user.organization_id
            }
        });
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(500).json({ message: 'Error verifying token' });
    }
});

export default router; 