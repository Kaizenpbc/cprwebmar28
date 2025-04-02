import express, { Response } from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { db } from '../config/db';
import { UserRole } from '../types';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Get all organizations
router.get('/', roleMiddleware([UserRole.ADMIN, UserRole.ORGANIZATION_ADMIN]), async (_, res: Response) => {
  try {
    const organizations = await db('organizations')
      .select('*')
      .orderBy('name');
    
    res.json(organizations);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({ message: 'Error fetching organizations' });
  }
});

// Get organization by ID
router.get('/:id', roleMiddleware([UserRole.ADMIN, UserRole.ORGANIZATION_ADMIN]), async (req, res: Response) => {
  try {
    const [organization] = await db('organizations')
      .select('*')
      .where({ id: req.params.id })
      .first();

    if (!organization) {
      res.status(404).json({ message: 'Organization not found' });
      return;
    }

    res.json(organization);
  } catch (error) {
    console.error('Error fetching organization:', error);
    res.status(500).json({ message: 'Error fetching organization' });
  }
});

// Create new organization
router.post('/', roleMiddleware([UserRole.ADMIN]), async (req, res: Response) => {
  try {
    const { name, address, phone, email } = req.body;
    
    const [organizationId] = await db('organizations').insert({
      name,
      address,
      phone,
      email,
      created_at: new Date(),
      updated_at: new Date()
    });

    res.status(201).json({ id: organizationId, message: 'Organization created successfully' });
  } catch (error) {
    console.error('Error creating organization:', error);
    res.status(500).json({ message: 'Error creating organization' });
  }
});

// Update organization
router.put('/:id', roleMiddleware([UserRole.ADMIN, UserRole.ORGANIZATION_ADMIN]), async (req, res: Response) => {
  try {
    const { name, address, phone, email } = req.body;
    
    await db('organizations')
      .where({ id: req.params.id })
      .update({
        name,
        address,
        phone,
        email,
        updated_at: new Date()
      });

    res.json({ message: 'Organization updated successfully' });
  } catch (error) {
    console.error('Error updating organization:', error);
    res.status(500).json({ message: 'Error updating organization' });
  }
});

// Delete organization
router.delete('/:id', roleMiddleware([UserRole.ADMIN]), async (req, res: Response) => {
  try {
    await db('organizations')
      .where({ id: req.params.id })
      .del();

    res.json({ message: 'Organization deleted successfully' });
  } catch (error) {
    console.error('Error deleting organization:', error);
    res.status(500).json({ message: 'Error deleting organization' });
  }
});

export default router; 