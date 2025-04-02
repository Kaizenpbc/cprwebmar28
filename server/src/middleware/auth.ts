import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: any;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log('Auth middleware - Request path:', req.path);
    console.log('Auth middleware - Has auth header:', !!authHeader);
    console.log('Auth middleware - Has token:', !!token);

    if (!token) {
        console.log('Auth middleware - No token provided');
        res.status(401).json({ message: 'No token provided' });
        return;
    }

    jwt.verify(token, process.env.JWT_SECRET || 'cpr_secret_key_2024', (err: any, user: any) => {
        if (err) {
            console.log('Auth middleware - Token verification failed:', err.message);
            res.status(403).json({ message: 'Invalid token' });
            return;
        }
        console.log('Auth middleware - Token verified, user:', { 
            id: user.userId, 
            role: user.role,
            portal: user.portal 
        });
        req.user = user;
        next();
    });
};

export const requireRole = (roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        console.log('Role middleware - Required roles:', roles);
        console.log('Role middleware - User role:', req.user?.role);

        if (!req.user) {
            console.log('Role middleware - No user found in request');
            res.status(401).json({ message: 'Authentication required' });
            return;
        }

        if (!roles.includes(req.user.role)) {
            console.log('Role middleware - Insufficient permissions. User role:', req.user.role);
            res.status(403).json({ message: 'Insufficient permissions' });
            return;
        }

        console.log('Role middleware - Role check passed');
        next();
    };
}; 