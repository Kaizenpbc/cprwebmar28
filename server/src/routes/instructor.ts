import express, { Response, Request } from 'express';
import { authMiddleware } from '../middleware/auth';
import { roleMiddleware } from '../middleware/role';
import { db } from '../config/db';
import { UserRole } from '../types/user';
import logger from '../utils/logger';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Get instructor's courses
router.get('/courses', roleMiddleware([UserRole.INSTRUCTOR]), async (req: Request, res: Response): Promise<void> => {
    const requestId = req.headers['x-request-id'] || Math.random().toString(36).substring(7);
    
    try {
        logger.debug('Fetching instructor courses:', {
            requestId,
            userId: req.user?.userId,
            timestamp: new Date().toISOString()
        });

        // Get instructor's courses from the database
        const courses = await db('course_instances')
            .select(
                'course_instances.id',
                'course_instances.course_number',
                'course_instances.requested_date',
                'organizations.name as organization_name',
                'course_instances.location',
                'course_types.name as course_type',
                'course_instances.max_students',
                'course_instances.status',
                db.raw('COUNT(student_registrations.id) as registered_students'),
                db.raw('COUNT(CASE WHEN student_attendance.attended = true THEN 1 END) as attended_students')
            )
            .leftJoin('organizations', 'course_instances.organization_id', 'organizations.id')
            .leftJoin('course_types', 'course_instances.course_type_id', 'course_types.id')
            .leftJoin('student_registrations', 'course_instances.id', 'student_registrations.course_instance_id')
            .leftJoin('student_attendance', 'course_instances.id', 'student_attendance.course_instance_id')
            .where('course_instances.instructor_id', req.user?.userId)
            .groupBy(
                'course_instances.id',
                'course_instances.course_number',
                'course_instances.requested_date',
                'organizations.name',
                'course_instances.location',
                'course_types.name',
                'course_instances.max_students',
                'course_instances.status'
            )
            .orderBy('course_instances.requested_date', 'desc');

        logger.debug('Courses fetched successfully:', {
            requestId,
            count: courses.length,
            timestamp: new Date().toISOString()
        });

        // Get available dates for scheduling
        const availableDates = await db('instructor_availability')
            .select('date')
            .where('instructor_id', req.user?.userId)
            .where('status', 'available')
            .orderBy('date', 'asc');

        logger.debug('Available dates fetched successfully:', {
            requestId,
            count: availableDates.length,
            timestamp: new Date().toISOString()
        });

        res.json({
            success: true,
            data: {
                courses,
                availableDates: availableDates.map(date => date.date)
            }
        });
    } catch (error) {
        logger.error('Error fetching instructor courses:', {
            requestId,
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            timestamp: new Date().toISOString()
        });
        
        res.status(500).json({
            success: false,
            error: 'Failed to fetch courses'
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