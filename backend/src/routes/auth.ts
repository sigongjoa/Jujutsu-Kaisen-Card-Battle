/**
 * Authentication routes
 */

import { Router, Request, Response } from 'express';
import { authService } from '../services/AuthService';
import { AuthRequest } from '../types';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, username } = req.body as AuthRequest & { username: string };

    if (!email || !password || !username) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const result = await authService.register(email, password, username);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as AuthRequest;

    if (!email || !password) {
      res.status(400).json({ error: 'Missing email or password' });
      return;
    }

    const result = await authService.login(email, password);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

/**
 * GET /api/auth/profile
 * Get current user profile
 */
router.get('/profile', (req: Request, res: Response): void => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const user = authService.verifyToken(token);
    if (!user) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    const profile = authService.getUserProfile(user.userId);
    res.status(200).json(profile);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
