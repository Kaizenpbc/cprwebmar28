import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: any;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: 'No token provided' });
        return;
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err: any, user: any) => {
        if (err) {
            res.status(403).json({ message: 'Invalid token' });
            return;
        }
        req.user = user;
        next();
    });
};

export const requireRole = (roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }

        if (!roles.includes(req.user.role)) {
            res.status(403).json({ message: 'Insufficient permissions' });
            return;
        }

        next();
    };
}; 