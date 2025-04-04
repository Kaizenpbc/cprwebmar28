import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { roleMiddleware } from '../middleware/role';
import { UserRole } from '../types/user';
import { db } from '../config/db';
import logger from '../utils/logger';

const router = Router();

// Get attendance for a specific course
router.get('/course/:courseId', authMiddleware, roleMiddleware([UserRole.SYSADMIN, UserRole.INSTRUCTOR]), async (req: Request & { user?: any }, res: Response): Promise<Response> => {
    try {
        const { courseId } = req.params;
        const attendance = await db('student_attendance')
            .where('course_instance_id', courseId)
            .select('*');
        return res.json(attendance);
    } catch (error) {
        logger.error('Error fetching attendance:', error);
        return res.status(500).json({ error: 'Failed to fetch attendance' });
    }
});

// Create new attendance record
router.post('/', authMiddleware, roleMiddleware([UserRole.SYSADMIN, UserRole.INSTRUCTOR]), async (req: Request & { user?: any }, res: Response): Promise<Response> => {
    try {
        const { studentId, courseInstanceId, status, date } = req.body;
        
        const [attendance] = await db('student_attendance')
            .insert({
                student_id: studentId,
                course_instance_id: courseInstanceId,
                status,
                date,
                created_at: new Date(),
                updated_at: new Date()
            })
            .returning('*');

        return res.status(201).json(attendance);
    } catch (error) {
        logger.error('Error creating attendance:', error);
        return res.status(500).json({ message: 'Error creating attendance' });
    }
});

// Update attendance record
router.put('/:id', authMiddleware, roleMiddleware([UserRole.SYSADMIN, UserRole.INSTRUCTOR]), async (req: Request & { user?: any }, res: Response): Promise<Response> => {
    try {
        const { status } = req.body;
        
        const [attendance] = await db('student_attendance')
            .where({ id: req.params.id })
            .update({
                status,
                updated_at: new Date()
            })
            .returning('*');

        if (!attendance) {
            return res.status(404).json({ message: 'Attendance record not found' });
        }

        return res.json(attendance);
    } catch (error) {
        logger.error('Error updating attendance:', error);
        return res.status(500).json({ message: 'Error updating attendance' });
    }
});

// Delete attendance record
router.delete('/:id', authMiddleware, roleMiddleware([UserRole.SYSADMIN]), async (req: Request & { user?: any }, res: Response): Promise<Response> => {
    try {
        const deleted = await db('student_attendance')
            .where({ id: req.params.id })
            .del();

        if (!deleted) {
            return res.status(404).json({ message: 'Attendance record not found' });
        }

        return res.json({ message: 'Attendance record deleted successfully' });
    } catch (error) {
        logger.error('Error deleting attendance:', error);
        return res.status(500).json({ message: 'Error deleting attendance' });
    }
});

export default router;
