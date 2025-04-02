import express, { Request, Response } from 'express';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { pool } from '../db';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all instructors
router.get('/', requireRole(['sysAdmin', 'orgAdmin', 'instructor']), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const result = await pool.query(
            'SELECT u.*, o.name as organization_name FROM users u ' +
            'LEFT JOIN organizations o ON u.organization_id = o.id ' +
            'WHERE u.role = $1 ' +
            'ORDER BY u.id ASC',
            ['instructor']
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching instructors:', error);
        res.status(500).json({ message: 'Error fetching instructors' });
    }
});

// Get instructor by ID
router.get('/:id', requireRole(['sysAdmin', 'orgAdmin', 'instructor']), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const result = await pool.query(
            'SELECT u.*, o.name as organization_name FROM users u ' +
            'LEFT JOIN organizations o ON u.organization_id = o.id ' +
            'WHERE u.role = $1 AND u.id = $2',
            ['instructor', req.params.id]
        );
        
        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Instructor not found' });
            return;
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching instructor:', error);
        res.status(500).json({ message: 'Error fetching instructor' });
    }
});

// Get instructor's availability
router.get('/:id/availability', requireRole(['sysAdmin', 'orgAdmin', 'instructor']), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const result = await pool.query(
            'SELECT * FROM instructor_availability WHERE instructor_id = $1',
            [req.params.id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching instructor availability:', error);
        res.status(500).json({ message: 'Error fetching availability' });
    }
});

// Get instructor's courses
router.get('/:id/courses', requireRole(['sysAdmin', 'orgAdmin', 'instructor']), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const result = await pool.query(
            'SELECT ci.*, c.name as course_name FROM course_instances ci ' +
            'JOIN courses c ON ci.course_id = c.id ' +
            'WHERE ci.instructor_id = $1 ' +
            'ORDER BY ci.date DESC',
            [req.params.id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching instructor courses:', error);
        res.status(500).json({ message: 'Error fetching courses' });
    }
});

// Set instructor's availability
router.post('/availability', requireRole(['instructor']), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { date } = req.body;
        const result = await pool.query(
            'INSERT INTO instructor_availability (instructor_id, date, status) VALUES ($1, $2, $3) RETURNING *',
            [req.user.userId, date, 'available']
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding availability:', error);
        res.status(500).json({ message: 'Error adding availability' });
    }
});

// Delete instructor's availability
router.delete('/availability/:date', requireRole(['instructor']), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const result = await pool.query(
            'DELETE FROM instructor_availability WHERE instructor_id = $1 AND date = $2 RETURNING *',
            [req.user.userId, req.params.date]
        );

        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Availability not found' });
            return;
        }

        res.json({ message: 'Availability removed successfully' });
    } catch (error) {
        console.error('Error removing availability:', error);
        res.status(500).json({ message: 'Error removing availability' });
    }
});

// Get instructor's schedule
router.get('/schedule', requireRole(['instructor']), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        // Get instructor's availability dates
        const availabilityResult = await pool.query(
            'SELECT date FROM instructor_availability WHERE instructor_id = $1',
            [req.user.userId]
        );

        // Get instructor's course instances
        const coursesResult = await pool.query(
            'SELECT ci.*, o.name as organization, c.name as course_name, ct.name as course_type ' +
            'FROM course_instances ci ' +
            'JOIN organizations o ON ci.organization_id = o.id ' +
            'JOIN courses c ON ci.course_id = c.id ' +
            'JOIN course_types ct ON ci.course_type_id = ct.id ' +
            'WHERE ci.instructor_id = $1 ' +
            'ORDER BY ci.date DESC',
            [req.user.userId]
        );

        const availability = availabilityResult.rows.map(a => ({
            id: `avail-${a.date}`,
            date: a.date,
            type: 'AVAILABILITY',
            status: 'available'
        }));

        const courses = coursesResult.rows.map(ci => ({
            id: ci.id,
            date: ci.date,
            organization: ci.organization,
            location: ci.location,
            course_type: ci.course_type,
            students_registered: ci.students_registered,
            students_attendance: ci.students_attendance,
            notes: ci.notes,
            status: ci.status
        }));

        // Combine and sort all entries
        const allEntries = [...courses, ...availability]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        res.json(allEntries);
    } catch (error) {
        console.error('Error fetching instructor schedule:', error);
        res.status(500).json({ message: 'Error fetching schedule' });
    }
});

// Update course status
router.put('/courses/:courseId', requireRole(['instructor']), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { status } = req.body;
        const result = await pool.query(
            'UPDATE course_instances SET status = $1, updated_at = $2 WHERE id = $3 AND instructor_id = $4 RETURNING *',
            [status, new Date(), req.params.courseId, req.user.userId]
        );

        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Course not found or not assigned to instructor' });
            return;
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating course status:', error);
        res.status(500).json({ message: 'Error updating course status' });
    }
});

export default router; 