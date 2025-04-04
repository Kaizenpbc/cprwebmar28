import express, { Request, Response } from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { db } from '../config/db';
import { UserRole } from '../types/user';
import logger from '../utils/logger';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Get all transactions
router.get('/', roleMiddleware([UserRole.SYSADMIN, UserRole.ORGADMIN]), async (_req: Request, res: Response): Promise<void> => {
  try {
    const transactions = await db('transactions')
      .select('*')
      .orderBy('created_at', 'desc');
    
    res.json(transactions);
  } catch (error) {
    logger.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Error fetching transactions' });
  }
});

// Create a new transaction
router.post('/', roleMiddleware([UserRole.SYSADMIN, UserRole.ORGADMIN]), async (req: Request, res: Response) => {
  try {
    const { amount, type, description, organization_id } = req.body;
    
    const transaction = await db('transactions')
      .insert({
        amount,
        type,
        description,
        organization_id,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*')
      .first();

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Error creating transaction' });
  }
});

// Get transaction by ID
router.get('/:id', roleMiddleware([UserRole.SYSADMIN, UserRole.ORGADMIN]), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const transaction = await db('transactions')
      .select('*')
      .where({ id })
      .first();

    if (!transaction) {
      res.status(404).json({ message: 'Transaction not found' });
      return;
    }

    res.json(transaction);
  } catch (error) {
    logger.error('Error fetching transaction:', error);
    res.status(500).json({ message: 'Error fetching transaction' });
  }
});

// Update transaction
router.put('/:id', roleMiddleware([UserRole.SYSADMIN, UserRole.ORGADMIN]), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const [updated] = await db('transactions')
      .where({ id })
      .update(updates)
      .returning('*');

    if (!updated) {
      res.status(404).json({ message: 'Transaction not found' });
      return;
    }

    res.json(updated);
  } catch (error) {
    logger.error('Error updating transaction:', error);
    res.status(500).json({ message: 'Error updating transaction' });
  }
});

// Delete transaction
router.delete('/:id', roleMiddleware([UserRole.SYSADMIN, UserRole.ORGADMIN]), async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await db('transactions')
      .where({ id })
      .delete()
      .returning('*');

    if (!deleted.length) {
      res.status(404).json({ message: 'Transaction not found' });
      return;
    }

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    logger.error('Error deleting transaction:', error);
    res.status(500).json({ message: 'Error deleting transaction' });
  }
});

export default router; 