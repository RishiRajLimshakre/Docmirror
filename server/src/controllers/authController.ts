import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim()) throw new AppError(400, 'Name is required');
    if (!email?.trim() || !validateEmail(email)) throw new AppError(400, 'Valid email is required');
    if (!password || password.length < 6) throw new AppError(400, 'Password must be at least 6 characters');

    const result = await authService.register(name.trim(), email.trim(), password);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !validateEmail(email)) throw new AppError(400, 'Valid email is required');
    if (!password) throw new AppError(400, 'Password is required');

    const result = await authService.login(email.trim(), password);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function me(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.userId) throw new AppError(401, 'Authentication required');
    const user = await authService.getUserById(req.userId);
    res.json({ user });
  } catch (error) {
    next(error);
  }
}

export function googleCallback(req: Request, res: Response) {
  const result = req.user as authService.AuthResult | undefined;
  const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:5173';

  if (!result?.token) {
    res.redirect(`${clientUrl}/login?error=google_failed`);
    return;
  }

  res.redirect(`${clientUrl}/auth/callback?token=${result.token}`);
}
