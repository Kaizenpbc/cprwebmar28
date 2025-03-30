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
// Get all organizations
router.get('/', (0, auth_1.requireRole)(['sysAdmin', 'orgAdmin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db_1.pool.query('SELECT * FROM organizations ORDER BY id ASC');
        res.json(result.rows);
    }
    catch (error) {
        console.error('Error fetching organizations:', error);
        res.status(500).json({ message: 'Error fetching organizations' });
    }
}));
// Get organization by ID
router.get('/:id', (0, auth_1.requireRole)(['sysAdmin', 'orgAdmin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db_1.pool.query('SELECT * FROM organizations WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Organization not found' });
            return;
        }
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error('Error fetching organization:', error);
        res.status(500).json({ message: 'Error fetching organization' });
    }
}));
// Create new organization (sysAdmin only)
router.post('/', (0, auth_1.requireRole)(['sysAdmin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, address, phone, email } = req.body;
        const result = yield db_1.pool.query('INSERT INTO organizations (name, address, phone, email) VALUES ($1, $2, $3, $4) RETURNING *', [name, address, phone, email]);
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        console.error('Error creating organization:', error);
        res.status(500).json({ message: 'Error creating organization' });
    }
}));
// Update organization (sysAdmin and orgAdmin)
router.put('/:id', (0, auth_1.requireRole)(['sysAdmin', 'orgAdmin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, address, phone, email } = req.body;
        // Check if organization exists
        const orgCheck = yield db_1.pool.query('SELECT * FROM organizations WHERE id = $1', [req.params.id]);
        if (orgCheck.rows.length === 0) {
            res.status(404).json({ message: 'Organization not found' });
            return;
        }
        // If orgAdmin, check if they belong to this organization
        if (req.user.role === 'orgAdmin' && req.user.organizationId !== parseInt(req.params.id)) {
            res.status(403).json({ message: 'Insufficient permissions' });
            return;
        }
        const result = yield db_1.pool.query('UPDATE organizations SET name = $1, address = $2, phone = $3, email = $4 WHERE id = $5 RETURNING *', [name, address, phone, email, req.params.id]);
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error('Error updating organization:', error);
        res.status(500).json({ message: 'Error updating organization' });
    }
}));
// Delete organization (sysAdmin only)
router.delete('/:id', (0, auth_1.requireRole)(['sysAdmin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db_1.pool.query('DELETE FROM organizations WHERE id = $1 RETURNING *', [req.params.id]);
        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Organization not found' });
            return;
        }
        res.json({ message: 'Organization deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting organization:', error);
        res.status(500).json({ message: 'Error deleting organization' });
    }
}));
exports.default = router;
