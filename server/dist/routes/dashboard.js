"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const router = (0, express_1.Router)();
// Get upcoming classes for the instructor
router.get('/upcoming-classes', ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || req.user.role !== 'instructor') {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }
        const query = `
      SELECT 
        ci.id,
        ci.requested_date as date,
        o.name as organization,
        ci.location,
        ci.course_type,
        COUNT(DISTINCT sr.student_id) as students_registered,
        ci.status
      FROM course_instances ci
      JOIN organizations o ON ci.organization_id = o.id
      LEFT JOIN student_registrations sr ON ci.id = sr.course_instance_id
      WHERE ci.instructor_id = $1
        AND ci.requested_date >= CURRENT_DATE
        AND ci.status = 'scheduled'
      GROUP BY ci.id, o.name, ci.location, ci.course_type, ci.status, ci.requested_date
      ORDER BY ci.requested_date ASC
      LIMIT 5
    `;
        const result = yield db_1.pool.query(query, [req.user.userId]);
        res.json({ success: true, classes: result.rows });
    }
    catch (error) {
        console.error('Error fetching upcoming classes:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch upcoming classes' });
    }
})));
// Get quick stats for the user
router.get('/quick-stats', ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || req.user.role !== 'instructor') {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }
        const userId = req.user.userId;
        const currentDate = new Date();
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        // Get classes this month
        const classesThisMonthQuery = `
      SELECT COUNT(*) as count
      FROM course_instances
      WHERE instructor_id = $1
        AND requested_date >= $2
        AND requested_date <= CURRENT_DATE
        AND status = 'completed'
    `;
        // Get total students who attended
        const totalStudentsQuery = `
      SELECT COUNT(DISTINCT sa.student_id) as total
      FROM course_instances ci
      JOIN student_attendance sa ON ci.id = sa.course_instance_id
      WHERE ci.instructor_id = $1
        AND ci.status = 'completed'
    `;
        // Get total hours taught (assuming each class is 4 hours)
        const hoursQuery = `
      SELECT COUNT(*) * 4 as total_hours
      FROM course_instances
      WHERE instructor_id = $1
        AND status = 'completed'
    `;
        // Get certifications issued
        const certificationsQuery = `
      SELECT COUNT(DISTINCT sa.student_id) as total
      FROM course_instances ci
      JOIN student_attendance sa ON ci.id = sa.course_instance_id
      WHERE ci.instructor_id = $1
        AND ci.status = 'completed'
    `;
        const [classesResult, studentsResult, hoursResult, certificationsResult] = yield Promise.all([
            db_1.pool.query(classesThisMonthQuery, [userId, firstDayOfMonth]),
            db_1.pool.query(totalStudentsQuery, [userId]),
            db_1.pool.query(hoursQuery, [userId]),
            db_1.pool.query(certificationsQuery, [userId])
        ]);
        const stats = {
            classesThisMonth: parseInt(classesResult.rows[0].count),
            totalStudents: parseInt(studentsResult.rows[0].total),
            hoursTaught: parseInt(hoursResult.rows[0].total_hours),
            certificationsIssued: parseInt(certificationsResult.rows[0].total)
        };
        res.json({ success: true, stats });
    }
    catch (error) {
        console.error('Error fetching quick stats:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch quick stats' });
    }
})));
// Get recent activity
router.get('/recent-activity', ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || req.user.role !== 'instructor') {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }
        const query = `
      SELECT 
        ci.id,
        ci.requested_date as date,
        o.name as organization,
        ci.course_type,
        ci.status,
        COUNT(DISTINCT sa.student_id) as students_attended
      FROM course_instances ci
      JOIN organizations o ON ci.organization_id = o.id
      LEFT JOIN student_attendance sa ON ci.id = sa.course_instance_id
      WHERE ci.instructor_id = $1
      GROUP BY ci.id, o.name, ci.course_type, ci.status, ci.requested_date
      ORDER BY ci.requested_date DESC
      LIMIT 5
    `;
        const result = yield db_1.pool.query(query, [req.user.userId]);
        res.json({ success: true, activities: result.rows });
    }
    catch (error) {
        console.error('Error fetching recent activity:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch recent activity' });
    }
})));
exports.default = router;
