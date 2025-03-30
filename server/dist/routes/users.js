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
// Get all users (sysAdmin and orgAdmin only)
router.get('/', (0, auth_1.requireRole)(['sysAdmin', 'orgAdmin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db_1.pool.query('SELECT * FROM users ORDER BY id ASC');
        res.json(result.rows);
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
}));
// Get user by ID
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Users can only view their own profile unless they are sysAdmin or orgAdmin
        if (req.user.role !== 'sysAdmin' && req.user.role !== 'orgAdmin' && req.user.userId !== parseInt(req.params.id)) {
            res.status(403).json({ message: 'Insufficient permissions' });
            return;
        }
        const result = yield db_1.pool.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Error fetching user' });
    }
}));
// Update user (sysAdmin only)
router.put('/:id', (0, auth_1.requireRole)(['sysAdmin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, role, organization_id } = req.body;
        // Check if user exists
        const userCheck = yield db_1.pool.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
        if (userCheck.rows.length === 0) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const result = yield db_1.pool.query('UPDATE users SET email = $1, role = $2, organization_id = $3 WHERE id = $4 RETURNING *', [email, role, organization_id, req.params.id]);
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Error updating user' });
    }
}));
// Delete user (sysAdmin only)
router.delete('/:id', (0, auth_1.requireRole)(['sysAdmin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db_1.pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [req.params.id]);
        if (result.rows.length === 0) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json({ message: 'User deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error deleting user' });
    }
}));
exports.default = router;
