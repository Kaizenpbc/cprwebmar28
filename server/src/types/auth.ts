import { Request } from 'express';

export interface AuthRequest extends Request {
    user?: {
        id: number;
        email: string;
        role: string;
        organization_id?: number;
    };
} 