import express, { Response } from 'express';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { pool } from '../db';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get instructor's courses
router.get('/courses', requireRole(['instructor']), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        console.log('Instructor courses route - Processing request for user:', req.user?.userId);
        console.log('Instructor courses route - User role:', req.user?.role);
        
        if (!req.user?.userId) {
            console.log('Instructor courses route - No user ID found in request');
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }

        const query = `
            SELECT 
                ci.id,
                ci.requested_date as date,
                o.name as organization,
                ci.location,
                ct.name as course_type,
                COALESCE(COUNT(DISTINCT sr.student_id), 0) as students_registered,
                0 as students_attendance,
                ci.status,
                ci.notes
            FROM course_instances ci 
            JOIN course_types ct ON ci.course_type_id = ct.id
            JOIN organizations o ON ci.organization_id = o.id
            LEFT JOIN student_registrations sr ON ci.id = sr.course_instance_id
            WHERE ci.instructor_id = $1 
            GROUP BY ci.id, ct.name, o.name, ci.location, ci.status, ci.notes
            ORDER BY ci.requested_date DESC
        `;
        
        console.log('Instructor courses route - Executing query with instructor_id:', req.user?.userId);
        const result = await pool.query(query, [req.user.userId]);
        console.log('Instructor courses route - Query result count:', result.rows.length);
        
        res.json(result.rows);
    } catch (error) {
        console.error('Instructor courses route - Error:', error);
        res.status(500).json({ success: false, message: 'Error fetching courses' });
    }
});

// Get instructor's availability
router.get('/availability', requireRole(['instructor']), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId || req.user.role !== 'instructor') {
            res.status(403).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const query = `
            SELECT date, status
            FROM instructor_availability
            WHERE instructor_id = $1
            ORDER BY date ASC
        `;

        const result = await pool.query(query, [req.user.userId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching instructor availability:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch availability' });
    }
});

// Add availability date
router.post('/availability', requireRole(['instructor']), async (req: AuthRequest, res: Response): Promise<void> => {
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
router.delete('/availability/:date', requireRole(['instructor']), async (req: AuthRequest, res: Response): Promise<void> => {
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