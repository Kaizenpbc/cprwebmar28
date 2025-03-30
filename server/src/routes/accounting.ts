import express, { RequestHandler, Response } from 'express';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { pool } from '../db';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken as RequestHandler);

// Get all transactions
router.get('/', requireRole(['sysAdmin', 'accountant']), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const result = await pool.query(
            'SELECT t.*, o.name as organization_name, u.email as user_email ' +
            'FROM transactions t ' +
            'LEFT JOIN organizations o ON t.organization_id = o.id ' +
            'LEFT JOIN users u ON t.user_id = u.id ' +
            'ORDER BY t.date DESC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ message: 'Error fetching transactions' });
    }
});

// Get transaction by ID
router.get('/:id', requireRole(['sysAdmin', 'accountant']), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const result = await pool.query(
            'SELECT t.*, o.name as organization_name, u.email as user_email ' +
            'FROM transactions t ' +
            'LEFT JOIN organizations o ON t.organization_id = o.id ' +
            'LEFT JOIN users u ON t.user_id = u.id ' +
            'WHERE t.id = $1',
            [req.params.id]
        );
        
        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Transaction not found' });
            return;
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching transaction:', error);
        res.status(500).json({ message: 'Error fetching transaction' });
    }
});

// Create new transaction
router.post('/', requireRole(['sysAdmin', 'accountant']), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { amount, type, description, organization_id } = req.body;
        const result = await pool.query(
            'INSERT INTO transactions (amount, type, description, organization_id, user_id, date) ' +
            'VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [amount, type, description, organization_id, req.user.userId, new Date()]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).json({ message: 'Error creating transaction' });
    }
});

// Update transaction
router.put('/:id', requireRole(['sysAdmin', 'accountant']), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { amount, type, description, organization_id } = req.body;
        
        // Check if transaction exists
        const transCheck = await pool.query('SELECT * FROM transactions WHERE id = $1', [req.params.id]);
        if (transCheck.rows.length === 0) {
            res.status(404).json({ message: 'Transaction not found' });
            return;
        }

        const result = await pool.query(
            'UPDATE transactions SET amount = $1, type = $2, description = $3, organization_id = $4, ' +
            'user_id = $5, updated_at = $6 WHERE id = $7 RETURNING *',
            [amount, type, description, organization_id, req.user.userId, new Date(), req.params.id]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating transaction:', error);
        res.status(500).json({ message: 'Error updating transaction' });
    }
});

// Delete transaction
router.delete('/:id', requireRole(['sysAdmin']), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const result = await pool.query('DELETE FROM transactions WHERE id = $1 RETURNING *', [req.params.id]);
        
        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Transaction not found' });
            return;
        }

        res.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        console.error('Error deleting transaction:', error);
        res.status(500).json({ message: 'Error deleting transaction' });
    }
});

export default router; 