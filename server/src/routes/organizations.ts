import express, { Response } from 'express';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { pool } from '../db';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all organizations
router.get('/', requireRole(['sysAdmin', 'orgAdmin']), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const result = await pool.query('SELECT * FROM organizations ORDER BY id ASC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching organizations:', error);
        res.status(500).json({ message: 'Error fetching organizations' });
    }
});

// Get organization by ID
router.get('/:id', requireRole(['sysAdmin', 'orgAdmin']), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const result = await pool.query('SELECT * FROM organizations WHERE id = $1', [req.params.id]);
        
        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Organization not found' });
            return;
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching organization:', error);
        res.status(500).json({ message: 'Error fetching organization' });
    }
});

// Create new organization (sysAdmin only)
router.post('/', requireRole(['sysAdmin']), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, address, phone, email } = req.body;
        const result = await pool.query(
            'INSERT INTO organizations (name, address, phone, email) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, address, phone, email]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating organization:', error);
        res.status(500).json({ message: 'Error creating organization' });
    }
});

// Update organization (sysAdmin and orgAdmin)
router.put('/:id', requireRole(['sysAdmin', 'orgAdmin']), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, address, phone, email } = req.body;
        
        // Check if organization exists
        const orgCheck = await pool.query('SELECT * FROM organizations WHERE id = $1', [req.params.id]);
        if (orgCheck.rows.length === 0) {
            res.status(404).json({ message: 'Organization not found' });
            return;
        }

        // If orgAdmin, check if they belong to this organization
        if (req.user.role === 'orgAdmin' && req.user.organizationId !== parseInt(req.params.id)) {
            res.status(403).json({ message: 'Insufficient permissions' });
            return;
        }

        const result = await pool.query(
            'UPDATE organizations SET name = $1, address = $2, phone = $3, email = $4 WHERE id = $5 RETURNING *',
            [name, address, phone, email, req.params.id]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating organization:', error);
        res.status(500).json({ message: 'Error updating organization' });
    }
});

// Delete organization (sysAdmin only)
router.delete('/:id', requireRole(['sysAdmin']), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const result = await pool.query('DELETE FROM organizations WHERE id = $1 RETURNING *', [req.params.id]);
        
        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Organization not found' });
            return;
        }

        res.json({ message: 'Organization deleted successfully' });
    } catch (error) {
        console.error('Error deleting organization:', error);
        res.status(500).json({ message: 'Error deleting organization' });
    }
});

export default router; 