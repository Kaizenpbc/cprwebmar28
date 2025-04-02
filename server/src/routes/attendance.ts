import express from 'express';
import { db } from '../db';
import { authMiddleware } from '../middleware/auth';
import { roleMiddleware } from '../middleware/role';
import { UserRole } from '../types';
import logger from '../utils/logger';
import { AppError } from '../middleware/error';

const router = express.Router();

// Get attendance for a course
router.get('/course/:courseId', authMiddleware, roleMiddleware([UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.ORGANIZATION_ADMIN]), async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const organizationId = req.user?.organizationId;

    if (!organizationId) {
      throw new AppError('Organization ID not found', 400);
    }

    const result = await db.query(
      `SELECT 
        sa.id,
        sa.student_registration_id,
        sa.attendance_date,
        sa.status,
        sa.notes,
        s.first_name,
        s.last_name,
        s.email
       FROM student_attendance sa
       JOIN student_registrations sr ON sa.student_registration_id = sr.id
       JOIN students s ON sr.student_id = s.id
       JOIN course_instances ci ON sr.course_instance_id = ci.id
       WHERE ci.id = $1 AND ci.organization_id = $2
       ORDER BY sa.attendance_date DESC`,
      [courseId, organizationId]
    );

    logger.info('Course attendance retrieved successfully', {
      courseId,
      organizationId,
      count: result.rows.length
    });

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Mark attendance for a student
router.post('/', authMiddleware, roleMiddleware([UserRole.ADMIN, UserRole.INSTRUCTOR]), async (req, res, next) => {
  try {
    const { studentRegistrationId, status, notes } = req.body;
    
    const result = await db.query(
      `INSERT INTO student_attendance (student_registration_id, attendance_date, status, notes)
       VALUES ($1, CURRENT_TIMESTAMP, $2, $3)
       RETURNING *`,
      [studentRegistrationId, status, notes]
    );

    logger.info('Attendance marked successfully', {
      studentRegistrationId,
      status,
      attendanceId: result.rows[0].id
    });

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Update attendance record
router.put('/:id', authMiddleware, roleMiddleware([UserRole.ADMIN, UserRole.INSTRUCTOR]), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    const result = await db.query(
      `UPDATE student_attendance
       SET status = $1, notes = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [status, notes, id]
    );

    if (result.rows.length === 0) {
      throw new AppError('Attendance record not found', 404);
    }

    logger.info('Attendance record updated successfully', {
      attendanceId: id,
      status
    });

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Delete attendance record
router.delete('/:id', authMiddleware, roleMiddleware([UserRole.ADMIN]), async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      'DELETE FROM student_attendance WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      throw new AppError('Attendance record not found', 404);
    }

    logger.info('Attendance record deleted successfully', {
      attendanceId: id
    });

    res.json({ message: 'Attendance record deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router; 