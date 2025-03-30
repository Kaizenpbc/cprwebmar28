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
// Get all transactions
router.get('/', (0, auth_1.requireRole)(['sysAdmin', 'accountant']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db_1.pool.query('SELECT t.*, o.name as organization_name, u.email as user_email ' +
            'FROM transactions t ' +
            'LEFT JOIN organizations o ON t.organization_id = o.id ' +
            'LEFT JOIN users u ON t.user_id = u.id ' +
            'ORDER BY t.date DESC');
        res.json(result.rows);
    }
    catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ message: 'Error fetching transactions' });
    }
}));
// Get transaction by ID
router.get('/:id', (0, auth_1.requireRole)(['sysAdmin', 'accountant']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db_1.pool.query('SELECT t.*, o.name as organization_name, u.email as user_email ' +
            'FROM transactions t ' +
            'LEFT JOIN organizations o ON t.organization_id = o.id ' +
            'LEFT JOIN users u ON t.user_id = u.id ' +
            'WHERE t.id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Transaction not found' });
            return;
        }
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error('Error fetching transaction:', error);
        res.status(500).json({ message: 'Error fetching transaction' });
    }
}));
// Create new transaction
router.post('/', (0, auth_1.requireRole)(['sysAdmin', 'accountant']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { amount, type, description, organization_id } = req.body;
        const result = yield db_1.pool.query('INSERT INTO transactions (amount, type, description, organization_id, user_id, date) ' +
            'VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [amount, type, description, organization_id, req.user.userId, new Date()]);
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).json({ message: 'Error creating transaction' });
    }
}));
// Update transaction
router.put('/:id', (0, auth_1.requireRole)(['sysAdmin', 'accountant']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { amount, type, description, organization_id } = req.body;
        // Check if transaction exists
        const transCheck = yield db_1.pool.query('SELECT * FROM transactions WHERE id = $1', [req.params.id]);
        if (transCheck.rows.length === 0) {
            res.status(404).json({ message: 'Transaction not found' });
            return;
        }
        const result = yield db_1.pool.query('UPDATE transactions SET amount = $1, type = $2, description = $3, organization_id = $4, ' +
            'user_id = $5, updated_at = $6 WHERE id = $7 RETURNING *', [amount, type, description, organization_id, req.user.userId, new Date(), req.params.id]);
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error('Error updating transaction:', error);
        res.status(500).json({ message: 'Error updating transaction' });
    }
}));
// Delete transaction
router.delete('/:id', (0, auth_1.requireRole)(['sysAdmin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db_1.pool.query('DELETE FROM transactions WHERE id = $1 RETURNING *', [req.params.id]);
        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Transaction not found' });
            return;
        }
        res.json({ message: 'Transaction deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting transaction:', error);
        res.status(500).json({ message: 'Error deleting transaction' });
    }
}));
exports.default = router;
