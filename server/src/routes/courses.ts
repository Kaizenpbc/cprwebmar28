import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { roleMiddleware } from '../middleware/role';
import { UserRole } from '../types/user';
import { db } from '../config/db';
import logger from '../utils/logger';

const router = Router();

// Get all courses for an organization
router.get('/', authMiddleware, roleMiddleware([UserRole.SYSADMIN, UserRole.ORGADMIN, UserRole.COURSEADMIN]), async (req: Request, res: Response): Promise<Response> => {
    try {
        const courses = await db('courses')
            .select('*')
            .where('organization_id', req.user?.organizationId);
        return res.json({ success: true, data: courses });
    } catch (error) {
        logger.error('Error fetching courses:', error);
        return res.status(500).json({ success: false, message: 'Error fetching courses' });
    }
});

// Get course by ID
router.get('/:id', authMiddleware, roleMiddleware([UserRole.SYSADMIN, UserRole.ORGADMIN, UserRole.COURSEADMIN]), async (req: Request, res: Response): Promise<Response> => {
    try {
        const course = await db('courses')
            .select('*')
            .where({
                'id': req.params.id,
                'organization_id': req.user?.organizationId
            })
            .first();

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        return res.json({ success: true, data: course });
    } catch (error) {
        logger.error('Error fetching course:', error);
        return res.status(500).json({ success: false, message: 'Error fetching course' });
    }
});

// Create course
router.post('/', authMiddleware, roleMiddleware([UserRole.SYSADMIN, UserRole.ORGADMIN, UserRole.COURSEADMIN]), async (req: Request, res: Response): Promise<Response> => {
    try {
        const { name, description, start_date, end_date } = req.body;

        if (!name || !start_date || !end_date) {
            return res.status(400).json({ success: false, message: 'Name, start date, and end date are required' });
        }

        const course = await db('courses')
            .insert({
                name,
                description,
                start_date,
                end_date,
                organization_id: req.user?.organizationId
            })
            .returning('*');

        return res.status(201).json({ success: true, data: course[0] });
    } catch (error) {
        logger.error('Error creating course:', error);
        return res.status(500).json({ success: false, message: 'Error creating course' });
    }
});

// Update course
router.put('/:id', authMiddleware, roleMiddleware([UserRole.SYSADMIN, UserRole.ORGADMIN, UserRole.COURSEADMIN]), async (req: Request, res: Response): Promise<Response> => {
    try {
        const { name, description, start_date, end_date } = req.body;

        if (!name && !description && !start_date && !end_date) {
            return res.status(400).json({ success: false, message: 'At least one field to update is required' });
        }

        const course = await db('courses')
            .where({
                'id': req.params.id,
                'organization_id': req.user?.organizationId
            })
            .update({
                name: name || db.raw('name'),
                description: description || db.raw('description'),
                start_date: start_date || db.raw('start_date'),
                end_date: end_date || db.raw('end_date'),
                updated_at: new Date()
            })
            .returning('*');

        if (!course.length) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        return res.json({ success: true, data: course[0] });
    } catch (error) {
        logger.error('Error updating course:', error);
        return res.status(500).json({ success: false, message: 'Error updating course' });
    }
});

// Delete course
router.delete('/:id', authMiddleware, roleMiddleware([UserRole.SYSADMIN, UserRole.ORGADMIN]), async (req: Request, res: Response): Promise<Response> => {
    try {
        const result = await db('courses')
            .where({
                'id': req.params.id,
                'organization_id': req.user?.organizationId
            })
            .delete();

        if (!result) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        return res.json({ success: true, message: 'Course deleted successfully' });
    } catch (error) {
        logger.error('Error deleting course:', error);
        return res.status(500).json({ success: false, message: 'Error deleting course' });
    }
});

export default router; 