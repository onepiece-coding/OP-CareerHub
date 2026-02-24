import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import { env } from '../env.js';
import User from '../models/User.js';

interface JwtPayload {
  id: string;
  role: string;
}

export async function authenticateUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    // Read from cookie `access_token`
    const token = (req.cookies && req.cookies.access_token) ?? undefined;
    if (!token) {
      return next(createError(401, 'No token provided'));
    }

    const payload = jwt.verify(token, env.JWT_SECRET!) as JwtPayload;
    const user = await User.findById(payload.id).select('-password');
    if (!user) return next(createError(404, 'User not found'));
    req.user = user;
    next();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    return next(createError(401, 'Invalid token'));
  }
}

export function authorizeRoles(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const userRole = req.user?.role;

    // Optional: allow admin to bypass everything (uncomment if desired)
    // if (userRole === "admin") return next();

    if (!roles.includes(userRole as string)) {
      return next(
        createError(403, 'You do not have permission to perform this action'),
      );
    }
    next();
  };
}
