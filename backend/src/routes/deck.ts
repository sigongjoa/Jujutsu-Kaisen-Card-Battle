/**
 * Deck routes
 */

import { Router, Request, Response } from 'express';
import { authService } from '../services/AuthService';
import { deckService } from '../services/DeckService';
import { CreateDeckRequest } from '../types';

const router = Router();

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
 * POST /api/deck
 * Create a new deck
 */
router.post('/', verifyToken, (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const deckRequest = req.body as CreateDeckRequest;

    if (!deckRequest.name || !deckRequest.cards) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const deck = deckService.createDeck(userId, deckRequest);
    res.status(201).json(deck);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/deck
 * Get user's decks
 */
router.get('/', verifyToken, (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const decks = deckService.getUserDecks(userId);
    res.status(200).json(decks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/deck/:deckId
 * Get specific deck
 */
router.get('/:deckId', verifyToken, (req: Request, res: Response) => {
  try {
    const { deckId } = req.params;
    const deck = deckService.getDeck(deckId);

    if (!deck) {
      return res.status(404).json({ error: 'Deck not found' });
    }

    // Check if user owns deck or it's public
    if (deck.ownerId !== (req as any).user.userId && !deck.isPublic) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const stats = deckService.getDeckStats(deck);
    res.status(200).json({ ...deck, stats });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/deck/:deckId
 * Update deck
 */
router.patch('/:deckId', verifyToken, (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { deckId } = req.params;
    const deckRequest = req.body as Partial<CreateDeckRequest>;

    const deck = deckService.updateDeck(deckId, userId, deckRequest);
    res.status(200).json(deck);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return res.status(403).json({ error: error.message });
    }
    res.status(400).json({ error: error.message });
  }
});

/**
 * DELETE /api/deck/:deckId
 * Delete deck
 */
router.delete('/:deckId', verifyToken, (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { deckId } = req.params;

    deckService.deleteDeck(deckId, userId);
    res.status(204).send();
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return res.status(403).json({ error: error.message });
    }
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/deck/:deckId/stats
 * Get deck statistics
 */
router.get('/:deckId/stats', verifyToken, (req: Request, res: Response) => {
  try {
    const { deckId } = req.params;
    const deck = deckService.getDeck(deckId);

    if (!deck) {
      return res.status(404).json({ error: 'Deck not found' });
    }

    const stats = deckService.getDeckStats(deck);
    res.status(200).json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
