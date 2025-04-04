import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { roleMiddleware } from '../middleware/role';
import { UserRole, JwtPayload } from '../types/user';
import { db } from '../db';

const router = Router();

// Get all students for an organization
router.get('/', authMiddleware, roleMiddleware([UserRole.SYSADMIN, UserRole.ORGADMIN]), async (req: Request & { user?: JwtPayload }, res: Response) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(403).json({ message: 'Organization ID not found' });
        }

        const students = await db.query(
            'SELECT * FROM students WHERE organization_id = $1',
            [req.user.organizationId]
        );
        return res.json(students.rows);
    } catch (error) {
        console.error('Error fetching students:', error);
        return res.status(500).json({ message: 'Error fetching students' });
    }
});

// Get a single student by ID
router.get('/:id', authMiddleware, roleMiddleware([UserRole.SYSADMIN, UserRole.ORGADMIN]), async (req: Request & { user?: JwtPayload }, res: Response) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(403).json({ message: 'Organization ID not found' });
        }

        const student = await db.query(
            'SELECT * FROM students WHERE id = $1 AND organization_id = $2',
            [req.params.id, req.user.organizationId]
        );
        
        if (student.rows.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }
        
        return res.json(student.rows[0]);
    } catch (error) {
        console.error('Error fetching student:', error);
        return res.status(500).json({ message: 'Error fetching student' });
    }
});

// Create a new student
router.post('/', authMiddleware, roleMiddleware([UserRole.SYSADMIN, UserRole.ORGADMIN]), async (req: Request & { user?: JwtPayload }, res: Response) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(403).json({ message: 'Organization ID not found' });
        }

        const { firstName, lastName, email, phone } = req.body;
        
        if (!firstName || !lastName || !email) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        
        const student = await db.query(
            'INSERT INTO students (first_name, last_name, email, phone, organization_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [firstName, lastName, email, phone, req.user.organizationId]
        );
        
        return res.status(201).json(student.rows[0]);
    } catch (error) {
        console.error('Error creating student:', error);
        return res.status(500).json({ message: 'Error creating student' });
    }
});

// Update a student
router.put('/:id', authMiddleware, roleMiddleware([UserRole.SYSADMIN, UserRole.ORGADMIN]), async (req: Request & { user?: JwtPayload }, res: Response) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(403).json({ message: 'Organization ID not found' });
        }

        const { firstName, lastName, email, phone } = req.body;
        
        if (!firstName && !lastName && !email && !phone) {
            return res.status(400).json({ message: 'No fields to update' });
        }
        
        const student = await db.query(
            'UPDATE students SET first_name = COALESCE($1, first_name), last_name = COALESCE($2, last_name), email = COALESCE($3, email), phone = COALESCE($4, phone), updated_at = NOW() WHERE id = $5 AND organization_id = $6 RETURNING *',
            [firstName, lastName, email, phone, req.params.id, req.user.organizationId]
        );
        
        if (student.rows.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }
        
        return res.json(student.rows[0]);
    } catch (error) {
        console.error('Error updating student:', error);
        return res.status(500).json({ message: 'Error updating student' });
    }
});

// Delete a student
router.delete('/:id', authMiddleware, roleMiddleware([UserRole.SYSADMIN, UserRole.ORGADMIN]), async (req: Request & { user?: JwtPayload }, res: Response) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(403).json({ message: 'Organization ID not found' });
        }

        const result = await db.query(
            'DELETE FROM students WHERE id = $1 AND organization_id = $2',
            [req.params.id, req.user.organizationId]
        );
        
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }
        
        return res.status(204).send();
    } catch (error) {
        console.error('Error deleting student:', error);
        return res.status(500).json({ message: 'Error deleting student' });
    }
});

export default router; 