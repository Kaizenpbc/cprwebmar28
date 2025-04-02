import express from 'express';
import { db } from '../db';
import { authMiddleware } from '../middleware/auth';
import { roleMiddleware } from '../middleware/role';
import { UserRole } from '../types';
import logger from '../utils/logger';
import { AppError } from '../middleware/error';

const router = express.Router();

// Get all students for an organization
router.get('/', authMiddleware, roleMiddleware([UserRole.ADMIN, UserRole.ORGANIZATION_ADMIN]), async (req, res, next) => {
  try {
    const organizationId = req.user?.organizationId;
    
    if (!organizationId) {
      throw new AppError('Organization ID not found', 400);
    }

    const result = await db.query(
      'SELECT * FROM students WHERE organization_id = $1 ORDER BY last_name, first_name',
      [organizationId]
    );

    logger.info('Students retrieved successfully', {
      organizationId,
      count: result.rows.length
    });

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Get a specific student
router.get('/:id', authMiddleware, roleMiddleware([UserRole.ADMIN, UserRole.ORGANIZATION_ADMIN]), async (req, res, next) => {
  try {
    const { id } = req.params;
    const organizationId = req.user?.organizationId;

    if (!organizationId) {
      throw new AppError('Organization ID not found', 400);
    }

    const result = await db.query(
      'SELECT * FROM students WHERE id = $1 AND organization_id = $2',
      [id, organizationId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Student not found', 404);
    }

    logger.info('Student retrieved successfully', {
      studentId: id,
      organizationId
    });

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Create a new student
router.post('/', authMiddleware, roleMiddleware([UserRole.ADMIN, UserRole.ORGANIZATION_ADMIN]), async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone } = req.body;
    const organizationId = req.user?.organizationId;

    if (!organizationId) {
      throw new AppError('Organization ID not found', 400);
    }

    const result = await db.query(
      `INSERT INTO students (first_name, last_name, email, phone, organization_id) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [firstName, lastName, email, phone, organizationId]
    );

    logger.info('Student created successfully', {
      studentId: result.rows[0].id,
      organizationId
    });

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Update a student
router.put('/:id', authMiddleware, roleMiddleware([UserRole.ADMIN, UserRole.ORGANIZATION_ADMIN]), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone } = req.body;
    const organizationId = req.user?.organizationId;

    if (!organizationId) {
      throw new AppError('Organization ID not found', 400);
    }

    const result = await db.query(
      `UPDATE students 
       SET first_name = $1, last_name = $2, email = $3, phone = $4 
       WHERE id = $5 AND organization_id = $6 
       RETURNING *`,
      [firstName, lastName, email, phone, id, organizationId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Student not found', 404);
    }

    logger.info('Student updated successfully', {
      studentId: id,
      organizationId
    });

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Delete a student
router.delete('/:id', authMiddleware, roleMiddleware([UserRole.ADMIN, UserRole.ORGANIZATION_ADMIN]), async (req, res, next) => {
  try {
    const { id } = req.params;
    const organizationId = req.user?.organizationId;

    if (!organizationId) {
      throw new AppError('Organization ID not found', 400);
    }

    const result = await db.query(
      'DELETE FROM students WHERE id = $1 AND organization_id = $2 RETURNING *',
      [id, organizationId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Student not found', 404);
    }

    logger.info('Student deleted successfully', {
      studentId: id,
      organizationId
    });

    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router; 