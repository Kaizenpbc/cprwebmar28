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
            WITH instructor_dates AS (
                SELECT 
                    NULL::integer as id,
                    date,
                    NULL::text as organization,
                    NULL::text as location,
                    NULL::text as course_type,
                    0::integer as students_registered,
                    0::integer as students_attendance,
                    'available'::text as status,
                    NULL::text as notes
                FROM instructor_availability 
                WHERE instructor_id = $1
                AND date >= CURRENT_DATE
                AND date NOT IN (
                    SELECT requested_date::date
                    FROM course_instances
                    WHERE instructor_id = $1
                )
            ),
            course_data AS (
                SELECT 
                    ci.id::integer,
                    ci.requested_date::date as date,
                    o.name::text as organization,
                    ci.location::text,
                    ct.name::text as course_type,
                    COALESCE(COUNT(DISTINCT sr.student_id), 0)::integer as students_registered,
                    COALESCE(COUNT(DISTINCT sa.student_id), 0)::integer as students_attendance,
                    ci.status::text,
                    ci.notes::text
                FROM course_instances ci 
                JOIN course_types ct ON ci.course_type_id = ct.id
                JOIN organizations o ON ci.organization_id = o.id
                LEFT JOIN student_registrations sr ON ci.id = sr.course_instance_id
                LEFT JOIN student_attendance sa ON ci.id = sa.course_instance_id AND sa.attended = true
                WHERE ci.instructor_id = $1 
                GROUP BY ci.id, ct.name, o.name, ci.location, ci.status, ci.notes
            )
            SELECT * FROM instructor_dates
            UNION ALL
            SELECT * FROM course_data
            ORDER BY date DESC
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