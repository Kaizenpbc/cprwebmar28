import express, { Response } from 'express';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { pool } from '../db';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get instructor's courses
router.get('/courses', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const result = await pool.query(
            'SELECT ci.*, c.name as course_name FROM course_instances ci ' +
            'JOIN courses c ON ci.course_id = c.id ' +
            'WHERE ci.instructor_id = $1 ' +
            'ORDER BY ci.date DESC',
            [req.user.userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching instructor courses:', error);
        res.status(500).json({ message: 'Error fetching courses' });
    }
});

// Get instructor's availability
router.get('/availability', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const result = await pool.query(
            'SELECT * FROM instructor_availability WHERE instructor_id = $1',
            [req.user.userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching instructor availability:', error);
        res.status(500).json({ message: 'Error fetching availability' });
    }
});

// Add availability date
router.post('/availability', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { date } = req.body;
        const result = await pool.query(
            'INSERT INTO instructor_availability (instructor_id, date) VALUES ($1, $2) RETURNING *',
            [req.user.userId, date]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding availability:', error);
        res.status(500).json({ message: 'Error adding availability' });
    }
});

// Remove availability date
router.delete('/availability/:date', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const result = await pool.query(
            'DELETE FROM instructor_availability WHERE instructor_id = $1 AND date = $2 RETURNING *',
            [req.user.userId, req.params.date]
        );
        
        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Availability not found' });
            return;
        }

        res.json({ message: 'Availability removed successfully' });
    } catch (error) {
        console.error('Error removing availability:', error);
        res.status(500).json({ message: 'Error removing availability' });
    }
});

export default router; 