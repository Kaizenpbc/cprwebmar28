import express from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { db } from '../config/db';
import { UserRole } from '../types';
import logger from '../utils/logger';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Get all courses for the organization
router.get('/courses', roleMiddleware([UserRole.ORGANIZATION_ADMIN]), async (req, res) => {
  try {
    const organizationId = req.user?.organizationId;
    
    if (!organizationId) {
      logger.warn('Organization courses route - No organization ID found in request');
      res.status(403).json({ message: 'Organization access required' });
      return;
    }

    const courses = await db('courses')
      .select('*')
      .where({ organization_id: organizationId })
      .orderBy('created_at', 'desc');
    
    res.json(courses);
  } catch (error) {
    logger.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Error fetching courses' });
  }
});

// Schedule a new course
router.post('/courses', roleMiddleware([UserRole.ORGANIZATION_ADMIN]), async (req, res) => {
  try {
    const { courseTypeId, date, location, notes } = req.body;
    const organizationId = req.user?.organizationId;
    
    if (!organizationId) {
      logger.warn('Organization courses route - No organization ID found in request');
      res.status(403).json({ message: 'Organization access required' });
      return;
    }

    // Generate a unique course number (yyyy-mm-dd-AAA-BBB)
    const courseNumber = `${date.replace(/-/g, '')}-${Math.random().toString(36).substring(2, 5).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

    // Get the first instructor for this organization
    const instructor = await db('users')
      .where({ organization_id: organizationId, role: UserRole.INSTRUCTOR })
      .select('id')
      .first();

    if (!instructor) {
      logger.warn('No instructor found for organization');
      res.status(400).json({ message: 'No instructor available for this organization' });
      return;
    }

    const [courseInstanceId] = await db('course_instances').insert({
      course_number: courseNumber,
      requested_date: date,
      organization_id: organizationId,
      course_type_id: courseTypeId,
      instructor_id: instructor.id,
      location,
      notes,
      status: 'pending',
      max_students: 10, // Default value
      created_at: new Date(),
      updated_at: new Date()
    }).returning('id');

    res.status(201).json({ id: courseInstanceId, message: 'Course scheduled successfully' });
  } catch (error) {
    logger.error('Error scheduling course:', error);
    res.status(500).json({ message: 'Error scheduling course' });
  }
});

// Get course types
router.get('/course-types', roleMiddleware([UserRole.ORGANIZATION_ADMIN]), async (req, res) => {
  try {
    const organizationId = req.user?.organizationId;
    
    if (!organizationId) {
      logger.warn('Organization course types route - No organization ID found in request');
      res.status(403).json({ message: 'Organization access required' });
      return;
    }

    const courseTypes = await db('course_types')
      .select('*')
      .where({ organization_id: organizationId })
      .orderBy('name');
    
    res.json(courseTypes);
  } catch (error) {
    logger.error('Error fetching course types:', error);
    res.status(500).json({ message: 'Error fetching course types' });
  }
});

// Get course details
router.get('/courses/:id', roleMiddleware([UserRole.ORGANIZATION_ADMIN]), async (req, res) => {
  try {
    const organizationId = req.user?.organizationId;
    
    if (!organizationId) {
      logger.warn('Organization course details route - No organization ID found in request');
      res.status(403).json({ message: 'Organization access required' });
      return;
    }

    const [course] = await db('courses')
      .select('*')
      .where({ 
        id: req.params.id,
        organization_id: organizationId 
      })
      .first();

    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    res.json(course);
  } catch (error) {
    logger.error('Error fetching course:', error);
    res.status(500).json({ message: 'Error fetching course' });
  }
});

// Update course status
router.patch('/courses/:id/status', roleMiddleware([UserRole.ORGANIZATION_ADMIN]), async (req, res) => {
  try {
    const organizationId = req.user?.organizationId;
    
    if (!organizationId) {
      logger.warn('Organization course status update route - No organization ID found in request');
      res.status(403).json({ message: 'Organization access required' });
      return;
    }

    const { status } = req.body;
    
    const [updatedCourse] = await db('courses')
      .where({ 
        id: req.params.id,
        organization_id: organizationId 
      })
      .update({
        status,
        updated_at: new Date()
      })
      .returning('*');

    if (!updatedCourse) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    res.json({ message: 'Course status updated successfully', course: updatedCourse });
  } catch (error) {
    logger.error('Error updating course status:', error);
    res.status(500).json({ message: 'Error updating course status' });
  }
});

export default router; 