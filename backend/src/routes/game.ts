/**
 * Game routes
 */

import { Router, Request, Response } from 'express';
import { authService } from '../services/AuthService';
import { GameEngine } from '../services/GameEngine';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Store active games in memory (in production, use database)
const activeGames: Map<string, GameEngine> = new Map();

/**
 * Middleware to verify JWT token
 */
const verifyToken = (req: Request, res: Response, next: Function) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const user = authService.verifyToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  (req as any).user = user;
  next();
};

/**
 * POST /api/game/create
 * Create a new game
 */
router.post('/create', verifyToken, (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { opponentId } = req.body;

    if (!opponentId) {
      return res.status(400).json({ error: 'Opponent ID required' });
    }

    const gameId = uuidv4();
    const matchId = uuidv4();

    const engine = new GameEngine(gameId, matchId, userId, opponentId);
    activeGames.set(gameId, engine);

    res.status(201).json({
      gameId,
      matchId,
      status: 'WAITING'
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/game/:gameId/start
 * Start a game
 */
router.post('/:gameId/start', verifyToken, (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;
    const engine = activeGames.get(gameId);

    if (!engine) {
      return res.status(404).json({ error: 'Game not found' });
    }

    engine.startGame();
    const gameState = engine.getGameState();

    res.status(200).json(gameState);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/game/:gameId
 * Get game state
 */
router.get('/:gameId', verifyToken, (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;
    const engine = activeGames.get(gameId);

    if (!engine) {
      return res.status(404).json({ error: 'Game not found' });
    }

    const gameState = engine.getGameState();
    res.status(200).json(gameState);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/game/:gameId/play
 * Play a card
 */
router.post('/:gameId/play', verifyToken, (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { gameId } = req.params;
    const { cardInstanceId, targetIds } = req.body;

    const engine = activeGames.get(gameId);
    if (!engine) {
      return res.status(404).json({ error: 'Game not found' });
    }

    const result = engine.playCard(userId, cardInstanceId, targetIds || []);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    const gameState = engine.getGameState();
    res.status(200).json(gameState);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/game/:gameId/attack
 * Declare attacks
 */
router.post('/:gameId/attack', verifyToken, (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { gameId } = req.params;
    const { attacks } = req.body;

    const engine = activeGames.get(gameId);
    if (!engine) {
      return res.status(404).json({ error: 'Game not found' });
    }

    const result = engine.declareAttacks(userId, attacks);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    const gameState = engine.getGameState();
    res.status(200).json(gameState);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/game/:gameId/pass
 * Pass turn
 */
router.post('/:gameId/pass', verifyToken, (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { gameId } = req.params;

    const engine = activeGames.get(gameId);
    if (!engine) {
      return res.status(404).json({ error: 'Game not found' });
    }

    engine.passAction(userId);
    const gameState = engine.getGameState();

    res.status(200).json(gameState);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/game/:gameId/surrender
 * Surrender game
 */
router.post('/:gameId/surrender', verifyToken, (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { gameId } = req.params;

    const engine = activeGames.get(gameId);
    if (!engine) {
      return res.status(404).json({ error: 'Game not found' });
    }

    engine.surrender(userId);
    const gameState = engine.getGameState();

    res.status(200).json(gameState);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
