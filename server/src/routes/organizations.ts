import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { roleMiddleware } from '../middleware/role';
import { UserRole } from '../types/user';
import { db } from '../config/db';
import logger from '../utils/logger';

const router = Router();

// Get all organizations (SYSADMIN only)
router.get('/', authMiddleware, roleMiddleware([UserRole.SYSADMIN]), async (_req: Request, res: Response): Promise<Response> => {
    try {
        const organizations = await db('organizations')
            .select('*');
        return res.json({ success: true, data: organizations });
    } catch (error) {
        logger.error('Error fetching organizations:', error);
        return res.status(500).json({ success: false, message: 'Error fetching organizations' });
    }
});

// Get organization by ID
router.get('/:id', authMiddleware, roleMiddleware([UserRole.SYSADMIN, UserRole.ORGADMIN]), async (req: Request, res: Response): Promise<Response> => {
    try {
        const organization = await db('organizations')
            .select('*')
            .where('id', req.params.id)
            .first();

        if (!organization) {
            return res.status(404).json({ success: false, message: 'Organization not found' });
        }

        // Check if user has access to this organization
        if (req.user?.role !== UserRole.SYSADMIN && req.user?.organizationId !== organization.id) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        return res.json({ success: true, data: organization });
    } catch (error) {
        logger.error('Error fetching organization:', error);
        return res.status(500).json({ success: false, message: 'Error fetching organization' });
    }
});

// Create organization (SYSADMIN only)
router.post('/', authMiddleware, roleMiddleware([UserRole.SYSADMIN]), async (req: Request, res: Response): Promise<Response> => {
    try {
        const { name, domain } = req.body;

        if (!name || !domain) {
            return res.status(400).json({ success: false, message: 'Name and domain are required' });
        }

        const organization = await db('organizations')
            .insert({
                name,
                domain
            })
            .returning('*');

        return res.status(201).json({ success: true, data: organization[0] });
    } catch (error) {
        logger.error('Error creating organization:', error);
        return res.status(500).json({ success: false, message: 'Error creating organization' });
    }
});

// Update organization
router.put('/:id', authMiddleware, roleMiddleware([UserRole.SYSADMIN, UserRole.ORGADMIN]), async (req: Request, res: Response): Promise<Response> => {
    try {
        const { name, domain } = req.body;

        if (!name && !domain) {
            return res.status(400).json({ success: false, message: 'At least one field to update is required' });
        }

        // Check if user has access to this organization
        if (req.user?.role !== UserRole.SYSADMIN && req.user?.organizationId !== parseInt(req.params.id)) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const organization = await db('organizations')
            .where('id', req.params.id)
            .update({
                name: name || db.raw('name'),
                domain: domain || db.raw('domain'),
                updated_at: new Date()
            })
            .returning('*');

        if (!organization.length) {
            return res.status(404).json({ success: false, message: 'Organization not found' });
        }

        return res.json({ success: true, data: organization[0] });
    } catch (error) {
        logger.error('Error updating organization:', error);
        return res.status(500).json({ success: false, message: 'Error updating organization' });
    }
});

// Delete organization (SYSADMIN only)
router.delete('/:id', authMiddleware, roleMiddleware([UserRole.SYSADMIN]), async (req: Request, res: Response): Promise<Response> => {
    try {
        const result = await db('organizations')
            .where('id', req.params.id)
            .delete();

        if (!result) {
            return res.status(404).json({ success: false, message: 'Organization not found' });
        }

        return res.json({ success: true, message: 'Organization deleted successfully' });
    } catch (error) {
        logger.error('Error deleting organization:', error);
        return res.status(500).json({ success: false, message: 'Error deleting organization' });
    }
});

export default router; 