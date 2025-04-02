import express, { Response, Request } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/db';
import { authMiddleware } from '../middleware/auth';
import { UserRole } from '../types';
import logger from '../utils/logger';

const router = express.Router();

// Register a new organization and user
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, organizationName } = req.body;

    // Check if user already exists
    const existingUser = await db('users').where({ email }).first();
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create organization
    const [organization] = await db('organizations')
      .insert({
        name: organizationName,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');

    if (!organization) {
      throw new Error('Failed to create organization');
    }

    // Create user
    const [user] = await db('users')
      .insert({
        email,
        password: hashedPassword,
        first_name: firstName,
        last_name: lastName,
        role: UserRole.ORGANIZATION_ADMIN,
        organization_id: organization.id,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');

    if (!user) {
      throw new Error('Failed to create user');
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email, role: UserRole.ORGANIZATION_ADMIN },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email,
        firstName,
        lastName,
        role: UserRole.ORGANIZATION_ADMIN,
        organizationId: organization.id
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

// Login user
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, portal } = req.body;
    logger.debug('Login attempt for email:', email);

    // Find user
    const user = await db('users')
      .select('*')
      .where({ email })
      .first();

    if (!user) {
      logger.warn('Login failed: User not found for email:', email);
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      logger.warn('Login failed: Invalid password for email:', email);
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Check portal access
    if (portal) {
      let portalRole: string | null = null;
      switch (portal.toLowerCase()) {
        case 'instructor':
          portalRole = 'instructor';
          break;
        case 'admin':
          portalRole = 'sysAdmin';
          break;
        case 'organization':
          portalRole = 'orgAdmin';
          break;
        case 'course':
          portalRole = 'courseAdmin';
          break;
        default:
          logger.warn('Login failed: Invalid portal specified:', portal);
          res.status(400).json({ message: 'Invalid portal specified' });
          return;
      }
      
      if (user.role.toLowerCase() !== portalRole.toLowerCase()) {
        logger.warn('Login failed: Access denied for portal. User role:', user.role, 'Required role:', portalRole);
        res.status(403).json({ message: 'Access denied for this portal' });
        return;
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        organizationId: user.organization_id,
        username: user.username
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    logger.debug('Login successful for user:', user.id);
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        organizationId: user.organization_id,
        isActive: user.is_active
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await db('users')
      .select('*')
      .where({ id: userId })
      .first();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      organizationId: user.organization_id
    });
  } catch (error) {
    logger.error('Error fetching user:', error);
    return res.status(500).json({ message: 'Error fetching user data' });
  }
});

export default router; 