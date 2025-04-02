import express, { Response, Request } from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { db } from '../config/db';
import { UserRole } from '../types';
import logger from '../utils/logger';
import { AppError } from '../middleware/error';

const router = express.Router();

// Input validation middleware
const validateCourseType = (req: Request, _res: Response, next: Function) => {
  const { name, description } = req.body;
  
  if (!name || typeof name !== 'string') {
    throw new AppError('Course type name is required and must be a string', 400);
  }
  
  if (name.length > 100) {
    throw new AppError('Course type name must be less than 100 characters', 400);
  }
  
  if (description && typeof description !== 'string') {
    throw new AppError('Description must be a string', 400);
  }
  
  if (description && description.length > 500) {
    throw new AppError('Description must be less than 500 characters', 400);
  }
  
  next();
};

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Get all course types
router.get('/', roleMiddleware([UserRole.ADMIN, UserRole.ORGANIZATION_ADMIN]), async (req: Request, res: Response) => {
  try {
    const organizationId = req.user?.organizationId;
    
    if (!organizationId) {
      logger.warn('Course types route - No organization ID found in request');
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
    throw new AppError('Error fetching course types', 500);
  }
});

// Create a new course type
router.post('/', 
  roleMiddleware([UserRole.ADMIN, UserRole.ORGANIZATION_ADMIN]),
  validateCourseType,
  async (req: Request, res: Response) => {
    try {
      const { name, description } = req.body;
      const organizationId = req.user?.organizationId;
      
      if (!organizationId) {
        logger.warn('Course types route - No organization ID found in request');
        res.status(403).json({ message: 'Organization access required' });
        return;
      }
      
      // Check if course type with same name already exists
      const existingCourseType = await db('course_types')
        .where({ name, organization_id: organizationId })
        .first();
      
      if (existingCourseType) {
        throw new AppError('A course type with this name already exists', 409);
      }
      
      const courseType = await db('course_types')
        .insert({
          name,
          description,
          organization_id: organizationId,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning('*')
        .first();

      if (!courseType) {
        throw new AppError('Failed to create course type', 500);
      }

      res.status(201).json(courseType);
    } catch (error) {
      logger.error('Error creating course type:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Error creating course type', 500);
    }
});

// Get course type by ID
router.get('/:id', roleMiddleware([UserRole.ADMIN, UserRole.ORGANIZATION_ADMIN]), async (req: Request, res: Response) => {
  try {
    const courseType = await db('course_types')
      .select('*')
      .where({ id: req.params.id })
      .first();

    if (!courseType) {
      throw new AppError('Course type not found', 404);
    }

    res.json(courseType);
  } catch (error) {
    logger.error('Error fetching course type:', error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Error fetching course type', 500);
  }
});

// Update course type
router.put('/:id', 
  roleMiddleware([UserRole.ADMIN, UserRole.ORGANIZATION_ADMIN]),
  validateCourseType,
  async (req: Request, res: Response) => {
    try {
      const { name, description } = req.body;
      const organizationId = req.user?.organizationId;
      
      if (!organizationId) {
        logger.warn('Course types route - No organization ID found in request');
        res.status(403).json({ message: 'Organization access required' });
        return;
      }
      
      // Check if course type exists
      const existingCourseType = await db('course_types')
        .where({ id: req.params.id, organization_id: organizationId })
        .first();
      
      if (!existingCourseType) {
        throw new AppError('Course type not found', 404);
      }
      
      // Check if another course type with same name exists
      const duplicateCourseType = await db('course_types')
        .where({ name, organization_id: organizationId })
        .whereNot({ id: req.params.id })
        .first();
      
      if (duplicateCourseType) {
        throw new AppError('A course type with this name already exists', 409);
      }
      
      const courseType = await db('course_types')
        .where({ id: req.params.id, organization_id: organizationId })
        .update({
          name,
          description,
          updated_at: new Date()
        })
        .returning('*')
        .first();

      if (!courseType) {
        throw new AppError('Failed to update course type', 500);
      }

      res.json(courseType);
    } catch (error) {
      logger.error('Error updating course type:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Error updating course type', 500);
    }
});

// Delete course type
router.delete('/:id', roleMiddleware([UserRole.ADMIN, UserRole.ORGANIZATION_ADMIN]), async (req: Request, res: Response) => {
  try {
    const organizationId = req.user?.organizationId;
    
    if (!organizationId) {
      logger.warn('Course types route - No organization ID found in request');
      res.status(403).json({ message: 'Organization access required' });
      return;
    }
    
    // Check if course type exists
    const existingCourseType = await db('course_types')
      .where({ id: req.params.id, organization_id: organizationId })
      .first();
    
    if (!existingCourseType) {
      throw new AppError('Course type not found', 404);
    }
    
    // Check if course type is being used
    const coursesUsingType = await db('courses')
      .where({ course_type_id: req.params.id })
      .first();
    
    if (coursesUsingType) {
      throw new AppError('Cannot delete course type that is being used by courses', 409);
    }
    
    const courseType = await db('course_types')
      .where({ id: req.params.id, organization_id: organizationId })
      .del()
      .returning('*')
      .first();

    if (!courseType) {
      throw new AppError('Failed to delete course type', 500);
    }

    res.json({ message: 'Course type deleted successfully' });
  } catch (error) {
    logger.error('Error deleting course type:', error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Error deleting course type', 500);
  }
});

export default router; 