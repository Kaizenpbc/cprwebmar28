import express, { Response } from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { db } from '../config/db';
import { UserRole } from '../types';
import logger from '../utils/logger';

const router = express.Router();

// Get all users (admin and organization admin only)
router.get('/', roleMiddleware([UserRole.ADMIN, UserRole.ORGANIZATION_ADMIN]), async (_, res: Response): Promise<void> => {
  try {
    const users = await db('users')
      .select('id', 'email', 'first_name', 'last_name', 'role', 'organization_id')
      .orderBy('created_at', 'desc');
    
    res.json(users);
  } catch (error) {
    logger.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Get user by ID
router.get('/:id', authMiddleware, async (req, res: Response): Promise<void> => {
  try {
    const [user] = await db('users')
      .select('id', 'email', 'first_name', 'last_name', 'role', 'organization_id')
      .where({ id: req.params.id })
      .first();

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    logger.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
});

// Update user
router.put('/:id', authMiddleware, async (req, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email } = req.body;
    
    await db('users')
      .where({ id: req.params.id })
      .update({
        first_name: firstName,
        last_name: lastName,
        email,
        updated_at: new Date()
      });

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    logger.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
});

// Delete user
router.delete('/:id', roleMiddleware([UserRole.ADMIN]), async (req, res: Response): Promise<void> => {
  try {
    await db('users')
      .where({ id: req.params.id })
      .del();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    logger.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

export default router; 