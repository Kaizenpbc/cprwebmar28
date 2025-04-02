import { Router, Response, RequestHandler } from 'express';
import { AuthRequest, requireRole } from '../middleware/auth';
import { pool } from '../db';

const router = Router();

// Get upcoming classes
router.get('/upcoming-classes', requireRole(['instructor']), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId || req.user.role !== 'instructor') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const query = `
      SELECT 
        ci.id,
        ci.requested_date as date,
        COALESCE(o.name, 'Unknown Organization') as organization,
        COALESCE(ci.location, 'Location TBD') as location,
        ct.name as course_type,
        COALESCE(COUNT(DISTINCT sr.student_id), 0) as students_registered,
        ci.status
      FROM course_instances ci
      LEFT JOIN organizations o ON ci.organization_id = o.id
      LEFT JOIN course_types ct ON ci.course_type_id = ct.id
      LEFT JOIN student_registrations sr ON ci.id = sr.course_instance_id
      WHERE ci.instructor_id = $1
        AND ci.status = 'scheduled'
        AND ci.requested_date >= CURRENT_DATE
      GROUP BY ci.id, o.name, ci.location, ct.name, ci.status, ci.requested_date
      ORDER BY ci.requested_date ASC
      LIMIT 5
    `;

    const result = await pool.query(query, [req.user.userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching upcoming classes:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch upcoming classes' });
  }
});

// Get quick stats
router.get('/quick-stats', requireRole(['instructor']), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId || req.user.role !== 'instructor') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const [
      classesThisMonth,
      totalStudents,
      totalHours,
      certifications
    ] = await Promise.all([
      // Classes this month
      pool.query(`
        SELECT COUNT(*) as count
        FROM course_instances
        WHERE instructor_id = $1
          AND EXTRACT(MONTH FROM requested_date) = EXTRACT(MONTH FROM CURRENT_DATE)
          AND EXTRACT(YEAR FROM requested_date) = EXTRACT(YEAR FROM CURRENT_DATE)
      `, [req.user.userId]),

      // Total students who attended
      pool.query(`
        SELECT COUNT(DISTINCT sa.student_id) as count
        FROM student_attendance sa
        JOIN course_instances ci ON sa.course_instance_id = ci.id
        WHERE ci.instructor_id = $1
          AND sa.attended = true
      `, [req.user.userId]),

      // Total hours taught
      pool.query(`
        SELECT COALESCE(SUM(ct.duration), 0) as hours
        FROM course_instances ci
        JOIN course_types ct ON ci.course_type_id = ct.id
        WHERE ci.instructor_id = $1
          AND ci.status = 'completed'
      `, [req.user.userId]),

      // Certifications issued
      pool.query(`
        SELECT COUNT(*) as count
        FROM student_attendance sa
        JOIN course_instances ci ON sa.course_instance_id = ci.id
        WHERE ci.instructor_id = $1
          AND sa.attended = true
          AND sa.certification_issued = true
      `, [req.user.userId])
    ]);

    res.json({
      classesThisMonth: parseInt(classesThisMonth.rows[0].count),
      totalStudents: parseInt(totalStudents.rows[0].count),
      totalHours: parseInt(totalHours.rows[0].hours),
      certifications: parseInt(certifications.rows[0].count)
    });
  } catch (error) {
    console.error('Error fetching quick stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch quick stats' });
  }
});

// Get recent activity
router.get('/recent-activity', requireRole(['instructor']), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId || req.user.role !== 'instructor') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const query = `
      SELECT 
        ci.id,
        ci.requested_date as date,
        COALESCE(o.name, 'Unknown Organization') as organization,
        ct.name as course_type,
        ci.status,
        COALESCE(COUNT(DISTINCT CASE WHEN sa.attended = true THEN sa.student_id END), 0) as students_attended
      FROM course_instances ci
      LEFT JOIN organizations o ON ci.organization_id = o.id
      LEFT JOIN course_types ct ON ci.course_type_id = ct.id
      LEFT JOIN student_attendance sa ON ci.id = sa.course_instance_id
      WHERE ci.instructor_id = $1
      GROUP BY ci.id, o.name, ct.name, ci.status, ci.requested_date
      ORDER BY ci.requested_date DESC
      LIMIT 10
    `;

    const result = await pool.query(query, [req.user.userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch recent activity' });
  }
});

export default router; 