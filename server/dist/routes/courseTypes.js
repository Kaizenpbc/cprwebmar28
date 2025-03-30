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
// Get all course types
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db_1.pool.query('SELECT * FROM course_types ORDER BY id ASC');
        res.json(result.rows);
    }
    catch (error) {
        console.error('Error fetching course types:', error);
        res.status(500).json({ message: 'Error fetching course types' });
    }
}));
// Get course type by ID
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db_1.pool.query('SELECT * FROM course_types WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Course type not found' });
            return;
        }
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error('Error fetching course type:', error);
        res.status(500).json({ message: 'Error fetching course type' });
    }
}));
// Create new course type (sysAdmin only)
router.post('/', (0, auth_1.requireRole)(['sysAdmin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description } = req.body;
        const result = yield db_1.pool.query('INSERT INTO course_types (name, description) VALUES ($1, $2) RETURNING *', [name, description]);
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        console.error('Error creating course type:', error);
        res.status(500).json({ message: 'Error creating course type' });
    }
}));
// Update course type (sysAdmin only)
router.put('/:id', (0, auth_1.requireRole)(['sysAdmin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description } = req.body;
        // Check if course type exists
        const typeCheck = yield db_1.pool.query('SELECT * FROM course_types WHERE id = $1', [req.params.id]);
        if (typeCheck.rows.length === 0) {
            res.status(404).json({ message: 'Course type not found' });
            return;
        }
        const result = yield db_1.pool.query('UPDATE course_types SET name = $1, description = $2 WHERE id = $3 RETURNING *', [name, description, req.params.id]);
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error('Error updating course type:', error);
        res.status(500).json({ message: 'Error updating course type' });
    }
}));
// Delete course type (sysAdmin only)
router.delete('/:id', (0, auth_1.requireRole)(['sysAdmin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db_1.pool.query('DELETE FROM course_types WHERE id = $1 RETURNING *', [req.params.id]);
        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Course type not found' });
            return;
        }
        res.json({ message: 'Course type deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting course type:', error);
        res.status(500).json({ message: 'Error deleting course type' });
    }
}));
exports.default = router;
