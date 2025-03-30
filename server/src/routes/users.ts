import express, { Request, Response } from 'express';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { pool } from '../db';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all users (sysAdmin and orgAdmin only)
router.get('/', requireRole(['sysAdmin', 'orgAdmin']), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const result = await pool.query('SELECT * FROM users ORDER BY id ASC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// Get user by ID
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        // Users can only view their own profile unless they are sysAdmin or orgAdmin
        if (req.user.role !== 'sysAdmin' && req.user.role !== 'orgAdmin' && req.user.userId !== parseInt(req.params.id)) {
            res.status(403).json({ message: 'Insufficient permissions' });
            return;
        }

        const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
        
        if (result.rows.length === 0) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Error fetching user' });
    }
});

// Update user (sysAdmin only)
router.put('/:id', requireRole(['sysAdmin']), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { email, role, organization_id } = req.body;
        
        // Check if user exists
        const userCheck = await pool.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
        if (userCheck.rows.length === 0) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const result = await pool.query(
            'UPDATE users SET email = $1, role = $2, organization_id = $3 WHERE id = $4 RETURNING *',
            [email, role, organization_id, req.params.id]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Error updating user' });
    }
});

// Delete user (sysAdmin only)
router.delete('/:id', requireRole(['sysAdmin']), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [req.params.id]);
        
        if (result.rows.length === 0) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error deleting user' });
    }
});

export default router; 