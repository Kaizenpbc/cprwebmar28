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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const db_1 = require("../db");
const router = express_1.default.Router();
// Apply authentication middleware to all routes
router.use(auth_1.authenticateToken);
// Get instructor's courses
router.get('/courses', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db_1.pool.query('SELECT ci.*, c.name as course_name FROM course_instances ci ' +
            'JOIN courses c ON ci.course_id = c.id ' +
            'WHERE ci.instructor_id = $1 ' +
            'ORDER BY ci.date DESC', [req.user.userId]);
        res.json(result.rows);
    }
    catch (error) {
        console.error('Error fetching instructor courses:', error);
        res.status(500).json({ message: 'Error fetching courses' });
    }
}));
// Get instructor's availability
router.get('/availability', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db_1.pool.query('SELECT * FROM instructor_availability WHERE instructor_id = $1', [req.user.userId]);
        res.json(result.rows);
    }
    catch (error) {
        console.error('Error fetching instructor availability:', error);
        res.status(500).json({ message: 'Error fetching availability' });
    }
}));
// Add availability date
router.post('/availability', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { date } = req.body;
        const result = yield db_1.pool.query('INSERT INTO instructor_availability (instructor_id, date) VALUES ($1, $2) RETURNING *', [req.user.userId, date]);
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        console.error('Error adding availability:', error);
        res.status(500).json({ message: 'Error adding availability' });
    }
}));
// Remove availability date
router.delete('/availability/:date', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db_1.pool.query('DELETE FROM instructor_availability WHERE instructor_id = $1 AND date = $2 RETURNING *', [req.user.userId, req.params.date]);
        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Availability not found' });
            return;
        }
        res.json({ message: 'Availability removed successfully' });
    }
    catch (error) {
        console.error('Error removing availability:', error);
        res.status(500).json({ message: 'Error removing availability' });
    }
}));
exports.default = router;
