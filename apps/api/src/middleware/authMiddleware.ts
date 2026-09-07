import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-for-personal-finance';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
      req.userId = decoded.userId;
      req.userEmail = decoded.email;
      return next();
    } catch {
      return res.status(401).json({ error: 'Invalid or expired authorization token' });
    }
  }

  // Fallback header for development / personal mode
  const customUserId = req.headers['x-user-id'] as string;
  if (customUserId) {
    req.userId = customUserId;
    return next();
  }

  return res.status(401).json({ error: 'Authorization token required' });
}

export function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
      req.userId = decoded.userId;
      req.userEmail = decoded.email;
    } catch {
      // ignore
    }
  }
  if (!req.userId && req.headers['x-user-id']) {
    req.userId = req.headers['x-user-id'] as string;
  }
  if (!req.userId) {
    req.userId = 'user_demo_1'; // default fallback for personal mode
  }
  next();
}
