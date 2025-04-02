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
        logger.debug('Instructor courses route - Full user object:', req.user);
        
        if (!req.user?.userId) {
            logger.warn('Instructor courses route - No user ID found in request');
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }

        // First check database connection and current database
        const dbInfo = await db.raw('SELECT current_database(), current_user');
        logger.debug('Database info:', dbInfo.rows[0]);

        // Check if instructor exists
        const instructor = await db('users')
            .where({ id: req.user.userId, role: UserRole.INSTRUCTOR })
            .first();
        logger.debug('Instructor info:', instructor);

        if (!instructor) {
            logger.warn('Instructor not found or not an instructor');
            res.status(403).json({ success: false, message: 'Not authorized as instructor' });
            return;
        }

        logger.debug('Instructor courses route - Executing query with instructor_id:', req.user.userId);
        
        // Store userId in a variable to avoid TypeScript errors in callbacks
        const userId = req.user.userId;
        
        // First, get just the course instances
        const courseData = await db('course_instances as ci')
            .select(
                'ci.id',
                'ci.requested_date as date',
                db.raw('COALESCE(o.name, \'Unknown Organization\')::text as organization'),
                db.raw('COALESCE(ci.location, \'Location TBD\')::text as location'),
                db.raw('COALESCE(ct.name, \'Unknown Course Type\')::text as course_type'),
                db.raw('COALESCE(COUNT(DISTINCT sr.student_id), 0)::integer as students_registered'),
                db.raw('COALESCE(COUNT(DISTINCT CASE WHEN sa.attended = true THEN sa.student_id END), 0)::integer as students_attendance'),
                'ci.status'
            )
            .leftJoin('organizations as o', 'ci.organization_id', 'o.id')
            .leftJoin('course_types as ct', 'ci.course_type_id', 'ct.id')
            .leftJoin('student_registrations as sr', 'ci.id', 'sr.course_instance_id')
            .leftJoin('student_attendance as sa', 'ci.id', 'sa.course_instance_id')
            .where('ci.instructor_id', userId)
            .groupBy('ci.id', 'ci.requested_date', 'o.name', 'ci.location', 'ct.name', 'ci.status');

        logger.debug('Course data:', courseData);

        // Then get available dates
        const availableDates = await db('instructor_availability')
            .select(
                db.raw('NULL::integer as id'),
                'date',
                db.raw('NULL::text as organization'),
                db.raw('NULL::text as location'),
                db.raw('NULL::text as course_type'),
                db.raw('0::integer as students_registered'),
                db.raw('0::integer as students_attendance'),
                db.raw("'available'::text as status")
            )
            .where('instructor_id', userId)
            .whereRaw('date >= CURRENT_DATE')
            .whereNotIn('date', function() {
                this.select('requested_date')
                    .from('course_instances')
                    .where('instructor_id', userId);
            });

        logger.debug('Available dates:', availableDates);

        // Combine and sort results
        const result = [...availableDates, ...courseData].sort((a, b) => {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        logger.debug('Final result count:', result.length);
        res.json({ success: true, data: result });
    } catch (error) {
        logger.error('Instructor courses route - Error:', error);
        logger.error('Error details:', error instanceof Error ? error.message : error);
        logger.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace available');
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching courses',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
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
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }

        const result = await db('instructor_availability')
            .insert({
                instructor_id: req.user.userId,
                date: date
            })
            .returning(['date', 'instructor_id']);

        if (!result || result.length === 0) {
            throw new Error('Failed to add availability');
        }

        res.status(201).json({ success: true, data: result[0] });
    } catch (error) {
        logger.error('Error adding availability:', error);
        res.status(500).json({ success: false, message: 'Error adding availability' });
    }
});

// Remove availability date
router.delete('/availability/:date', roleMiddleware([UserRole.INSTRUCTOR]), async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }

        const result = await db('instructor_availability')
            .where({
                instructor_id: req.user.userId,
                date: req.params.date
            })
            .del()
            .returning(['date', 'instructor_id']);
        
        if (!result || result.length === 0) {
            res.status(404).json({ success: false, message: 'Availability not found' });
            return;
        }

        res.json({ success: true, message: 'Availability removed successfully', data: result[0] });
    } catch (error) {
        logger.error('Error removing availability:', error);
        res.status(500).json({ success: false, message: 'Error removing availability' });
    }
});

export default router; 