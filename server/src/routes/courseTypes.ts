import express, { Response } from 'express';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { pool } from '../db';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all course types
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const result = await pool.query('SELECT * FROM course_types ORDER BY id ASC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching course types:', error);
        res.status(500).json({ message: 'Error fetching course types' });
    }
});

// Get course type by ID
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const result = await pool.query('SELECT * FROM course_types WHERE id = $1', [req.params.id]);
        
        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Course type not found' });
            return;
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching course type:', error);
        res.status(500).json({ message: 'Error fetching course type' });
    }
});

// Create new course type (sysAdmin only)
router.post('/', requireRole(['sysAdmin']), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, description } = req.body;
        const result = await pool.query(
            'INSERT INTO course_types (name, description) VALUES ($1, $2) RETURNING *',
            [name, description]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating course type:', error);
        res.status(500).json({ message: 'Error creating course type' });
    }
});

// Update course type (sysAdmin only)
router.put('/:id', requireRole(['sysAdmin']), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, description } = req.body;
        
        // Check if course type exists
        const typeCheck = await pool.query('SELECT * FROM course_types WHERE id = $1', [req.params.id]);
        if (typeCheck.rows.length === 0) {
            res.status(404).json({ message: 'Course type not found' });
            return;
        }

        const result = await pool.query(
            'UPDATE course_types SET name = $1, description = $2 WHERE id = $3 RETURNING *',
            [name, description, req.params.id]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating course type:', error);
        res.status(500).json({ message: 'Error updating course type' });
    }
});

// Delete course type (sysAdmin only)
router.delete('/:id', requireRole(['sysAdmin']), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const result = await pool.query('DELETE FROM course_types WHERE id = $1 RETURNING *', [req.params.id]);
        
        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Course type not found' });
            return;
        }

        res.json({ message: 'Course type deleted successfully' });
    } catch (error) {
        console.error('Error deleting course type:', error);
        res.status(500).json({ message: 'Error deleting course type' });
    }
});

export default router; 