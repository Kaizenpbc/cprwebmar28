import express, { Response, Request } from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { db } from '../config/db';
import { UserRole } from '../types';
import logger from '../utils/logger';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Get instructor's courses
router.get('/courses', roleMiddleware([UserRole.INSTRUCTOR]), async (req: Request, res: Response): Promise<void> => {
    try {
        logger.debug('Instructor courses route - Processing request for user:', req.user?.userId);
        logger.debug('Instructor courses route - User role:', req.user?.role);
        
        if (!req.user?.userId) {
            logger.warn('Instructor courses route - No user ID found in request');
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }

        const query = `
            WITH instructor_dates AS (
                SELECT 
                    NULL::integer as id,
                    date::date,
                    NULL::text as organization,
                    NULL::text as location,
                    NULL::text as course_type,
                    0::integer as students_registered,
                    0::integer as students_attendance,
                    'available'::text as status,
                    NULL::text as notes
                FROM instructor_availability 
                WHERE instructor_id = ?
                AND date >= CURRENT_DATE
                AND date NOT IN (
                    SELECT start_time::date
                    FROM course_instances
                    WHERE instructor_id = ?
                )
            ),
            course_data AS (
                SELECT 
                    ci.id::integer,
                    ci.start_time::date as date,
                    COALESCE(o.name, 'Unknown Organization')::text as organization,
                    COALESCE(ci.location, 'Location TBD')::text as location,
                    COALESCE(ct.name, 'Unknown Course Type')::text as course_type,
                    COALESCE(COUNT(DISTINCT e.student_id), 0)::integer as students_registered,
                    COALESCE(COUNT(DISTINCT CASE WHEN a.status = 'PRESENT' THEN a.student_id END), 0)::integer as students_attendance,
                    ci.status::text,
                    COALESCE(ci.notes, '')::text as notes
                FROM course_instances ci
                LEFT JOIN organizations o ON ci.organization_id = o.id
                LEFT JOIN course_types ct ON ci.course_type_id = ct.id
                LEFT JOIN enrollments e ON ci.id = e.course_instance_id
                LEFT JOIN attendance a ON ci.id = a.course_instance_id
                WHERE ci.instructor_id = ?
                GROUP BY ci.id, ci.start_time, o.name, ci.location, ct.name, ci.status, ci.notes
            )
            SELECT * FROM instructor_dates
            UNION ALL
            SELECT * FROM course_data
            ORDER BY date DESC
        `;
        
        logger.debug('Instructor courses route - Executing query with instructor_id:', req.user?.userId);
        const result = await db.raw(query, [req.user.userId, req.user.userId, req.user.userId]);
        logger.debug('Instructor courses route - Query result count:', result.rows.length);
        
        res.json(result.rows);
    } catch (error) {
        logger.error('Instructor courses route - Error:', error);
        res.status(500).json({ success: false, message: 'Error fetching courses' });
    }
});

// Get instructor's availability
router.get('/availability', roleMiddleware([UserRole.INSTRUCTOR]), async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId || req.user.role !== UserRole.INSTRUCTOR) {
            res.status(403).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const result = await db('instructor_availability')
            .select('date', 'status')
            .where('instructor_id', req.user.userId)
            .orderBy('date', 'asc');

        res.json(result);
    } catch (error) {
        logger.error('Error fetching instructor availability:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch availability' });
    }
});

// Add availability date
router.post('/availability', roleMiddleware([UserRole.INSTRUCTOR]), async (req: Request, res: Response): Promise<void> => {
    try {
        const { date } = req.body;
        if (!req.user?.userId) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }

        const result = await db('instructor_availability')
            .insert({
                instructor_id: req.user.userId,
                date: date
            })
            .returning('*')
            .first();

        if (!result) {
            throw new Error('Failed to add availability');
        }

        res.status(201).json(result);
    } catch (error) {
        logger.error('Error adding availability:', error);
        res.status(500).json({ message: 'Error adding availability' });
    }
});

// Remove availability date
router.delete('/availability/:date', roleMiddleware([UserRole.INSTRUCTOR]), async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }

        const result = await db('instructor_availability')
            .where({
                instructor_id: req.user.userId,
                date: req.params.date
            })
            .del()
            .returning('*')
            .first();
        
        if (!result) {
            res.status(404).json({ message: 'Availability not found' });
            return;
        }

        res.json({ message: 'Availability removed successfully' });
    } catch (error) {
        logger.error('Error removing availability:', error);
        res.status(500).json({ message: 'Error removing availability' });
    }
});

export default router; 