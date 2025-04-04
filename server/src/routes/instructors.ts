import express, { Response } from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { db } from '../config/db';
import { UserRole } from '../types/user';
import logger from '../utils/logger';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Get all instructors
router.get('/', roleMiddleware([UserRole.SYSADMIN, UserRole.ORGADMIN]), async (_, res: Response) => {
  try {
    const instructors = await db('users')
      .select('*')
      .where({ role: UserRole.INSTRUCTOR })
      .orderBy('created_at', 'desc');
    
    res.json(instructors);
  } catch (error) {
    logger.error('Error fetching instructors:', error);
    res.status(500).json({ message: 'Error fetching instructors' });
  }
});

// Get instructor by ID
router.get('/:id', roleMiddleware([UserRole.SYSADMIN, UserRole.ORGADMIN, UserRole.INSTRUCTOR]), async (req, res: Response) => {
  try {
    const instructor = await db('users')
      .select('*')
      .where({ id: req.params.id, role: UserRole.INSTRUCTOR })
      .first();

    if (!instructor) {
      res.status(404).json({ message: 'Instructor not found' });
      return;
    }

    res.json(instructor);
  } catch (error) {
    logger.error('Error fetching instructor:', error);
    res.status(500).json({ message: 'Error fetching instructor' });
  }
});

// Get instructor availability
router.get('/:id/availability', roleMiddleware([UserRole.SYSADMIN, UserRole.ORGADMIN, UserRole.INSTRUCTOR]), async (req, res: Response) => {
  try {
    const availability = await db('instructor_availability')
      .select('*')
      .where({ instructor_id: req.params.id })
      .orderBy('date');

    res.json(availability);
  } catch (error) {
    logger.error('Error fetching instructor availability:', error);
    res.status(500).json({ message: 'Error fetching instructor availability' });
  }
});

// Get instructor courses
router.get('/:id/courses', roleMiddleware([UserRole.SYSADMIN, UserRole.ORGADMIN, UserRole.INSTRUCTOR]), async (req, res: Response) => {
  try {
    const courses = await db('course_instances')
      .select('*')
      .where({ instructor_id: req.params.id })
      .orderBy('requested_date');

    res.json(courses);
  } catch (error) {
    logger.error('Error fetching instructor courses:', error);
    res.status(500).json({ message: 'Error fetching instructor courses' });
  }
});

// Update instructor availability
router.post('/:id/availability', roleMiddleware([UserRole.SYSADMIN, UserRole.ORGADMIN, UserRole.INSTRUCTOR]), async (req, res: Response) => {
  try {
    const { date, is_available } = req.body;
    
    await db('instructor_availability').insert({
      instructor_id: req.params.id,
      date: date,
      status: is_available ? 'available' : 'unavailable',
      created_at: new Date(),
      updated_at: new Date()
    });

    res.status(201).json({ message: 'Availability updated successfully' });
  } catch (error) {
    logger.error('Error updating instructor availability:', error);
    res.status(500).json({ message: 'Error updating instructor availability' });
  }
});

export default router; 