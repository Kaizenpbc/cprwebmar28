import express, { Response, Request } from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { db } from '../config/db';
import { UserRole } from '../types';
import logger from '../utils/logger';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Get upcoming classes
router.get('/upcoming-classes', roleMiddleware([UserRole.INSTRUCTOR]), async (req: Request, res: Response): Promise<void> => {
  try {
    const upcomingClasses = await db('course_instances')
      .select('*')
      .where('instructor_id', req.user?.userId)
      .where('start_time', '>', new Date())
      .orderBy('start_time', 'asc')
      .limit(5);

    res.json(upcomingClasses);
  } catch (error) {
    logger.error('Error fetching upcoming classes:', error);
    res.status(500).json({ message: 'Error fetching upcoming classes' });
  }
});

// Get quick stats
router.get('/quick-stats', roleMiddleware([UserRole.INSTRUCTOR]), async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await db('course_instances')
      .select(
        db.raw('COUNT(*) as total_classes'),
        db.raw('COUNT(CASE WHEN status = ? THEN 1 END) as upcoming_classes', ['SCHEDULED']),
        db.raw('COUNT(CASE WHEN status = ? THEN 1 END) as completed_classes', ['COMPLETED'])
      )
      .where('instructor_id', req.user?.userId)
      .first();

    res.json(stats);
  } catch (error) {
    logger.error('Error fetching quick stats:', error);
    res.status(500).json({ message: 'Error fetching quick stats' });
  }
});

// Get recent activity
router.get('/recent-activity', roleMiddleware([UserRole.INSTRUCTOR]), async (req: Request, res: Response): Promise<void> => {
  try {
    const recentActivity = await db('course_instances')
      .select('*')
      .where('instructor_id', req.user?.userId)
      .orderBy('created_at', 'desc')
      .limit(10);

    res.json(recentActivity);
  } catch (error) {
    logger.error('Error fetching recent activity:', error);
    res.status(500).json({ message: 'Error fetching recent activity' });
  }
});

export default router; 