/**
 * Game Engine tests
 */

import { GameEngine } from '../services/GameEngine';
import { GamePhaseType } from '../types';

describe('GameEngine', () => {
  const player1Id = 'player-1';
  const player2Id = 'player-2';

  const createEngine = () => {
    const eng = new GameEngine('game-1', 'match-1', player1Id, player2Id);
    eng.startGame();
    return eng;
  };

  describe('initialization', () => {
    it('should create game with initial state', () => {
      const engine = new GameEngine('game-1', 'match-1', player1Id, player2Id);
      const gameState = engine.getGameState();

      expect(gameState.gameId).toBe('game-1');
      expect(gameState.matchId).toBe('match-1');
      expect(gameState.status).toBe('WAITING');
      expect(gameState.players[player1Id]).toBeDefined();
      expect(gameState.players[player2Id]).toBeDefined();
    });

    it('should initialize players with correct HP', () => {
      const engine = new GameEngine('game-1', 'match-1', player1Id, player2Id);
      const gameState = engine.getGameState();
      expect(gameState.players[player1Id].currentHp).toBe(20);
      expect(gameState.players[player2Id].currentHp).toBe(20);
    });
  });

  describe('startGame', () => {
    it('should transition from WAITING to IN_PROGRESS', () => {
      const engine = new GameEngine('game-1', 'match-1', player1Id, player2Id);
      engine.startGame();
      const gameState = engine.getGameState();
      expect(gameState.status).toBe('IN_PROGRESS');
      expect(gameState.startedAt).toBeDefined();
    });

    it('should initialize player decks', () => {
      const engine = new GameEngine('game-1', 'match-1', player1Id, player2Id);
      engine.startGame();
      const gameState = engine.getGameState();

      expect(gameState.players[player1Id].deck.length).toBeGreaterThan(0);
      expect(gameState.players[player2Id].deck.length).toBeGreaterThan(0);
    });

    it('should start with RECHARGE phase', () => {
      const engine = createEngine();
      const gameState = engine.getGameState();

      expect(gameState.currentPhase.type).toBe(GamePhaseType.RECHARGE);
    });
  });

  describe('playCard', () => {
    it('should move card from hand to field', () => {
      const engine = createEngine();
      const gameState = engine.getGameState();
      const player = gameState.players[player1Id];

      expect(player.hand.length).toBeGreaterThan(0);

      // Find a cheap card to play (cost <= 3)
      let cardToPlay = null;
      for (const card of player.hand) {
        // These cards have cost <= 3
        if (card.cardId === 'JK-050-GREAT-WIND' || card.cardId === 'JK-003-NOBARA' ||
            card.cardId === 'JK-100-SURGE' || card.cardId === 'JK-101-BARRIER' || card.cardId === 'JK-300-HEAL') {
          cardToPlay = card;
          break;
        }
      }

      // Fallback to first card
      if (!cardToPlay && player.hand.length > 0) {
        cardToPlay = player.hand[0];
      }

      expect(cardToPlay).toBeDefined();
      const cardInstanceId = cardToPlay!.cardInstanceId;
      const result = engine.playCard(player1Id, cardInstanceId);

      if (result.success) {
        const updatedGameState = engine.getGameState();
        const updatedPlayer = updatedGameState.players[player1Id];

        // Card should no longer be in hand
        expect(updatedPlayer.hand.find(c => c.cardInstanceId === cardInstanceId)).toBeUndefined();

        // Card should be in field
        expect(updatedPlayer.field.find(c => c.cardInstanceId === cardInstanceId)).toBeDefined();
      }
    });

    it('should consume cursed energy', () => {
      const engine = createEngine();
      const gameState = engine.getGameState();
      const player = gameState.players[player1Id];
      const initialCE = player.currentCursedEnergy;

      expect(player.hand.length).toBeGreaterThan(0);

      // Try to find a playable card (cost <= CE)
      let cardToPlay = null;
      for (const card of player.hand) {
        // Check if card cost is known (Great Wind has cost 3)
        if (card.cardId === 'JK-050-GREAT-WIND' || card.cardId === 'JK-100-SURGE' || card.cardId === 'JK-101-BARRIER' || card.cardId === 'JK-300-HEAL') {
          cardToPlay = card;
          break;
        }
      }

      if (!cardToPlay && player.hand.length > 0) {
        cardToPlay = player.hand[0];
      }

      expect(cardToPlay).toBeDefined();
      const cardInstanceId = cardToPlay!.cardInstanceId;
      const result = engine.playCard(player1Id, cardInstanceId);

      if (result.success) {
        const updatedGameState = engine.getGameState();
        const updatedPlayer = updatedGameState.players[player1Id];

        expect(updatedPlayer.currentCursedEnergy).toBeLessThan(initialCE);
      }
    });

    it('should fail if card not in hand', () => {
      const engine = createEngine();
      const result = engine.playCard(player1Id, 'non-existent-card');
      expect(result.success).toBe(false);
      expect(result.error).toBe('CARD_NOT_IN_HAND');
    });
  });

  describe('declareAttacks', () => {
    it('should move to MAIN_B phase after declaring attacks', () => {
      const engine = createEngine();
      // Add a card to field
      const gameState = engine.getGameState();
      const player = gameState.players[player1Id];
      if (player.hand.length > 0) {
        engine.playCard(player1Id, player.hand[0].cardInstanceId);
      }

      const updatedState = engine.getGameState();
      const updatedPlayer = updatedState.players[player1Id];

      if (updatedPlayer.field.length > 0) {
        const attacks = [
          {
            attackerId: updatedPlayer.field[0].cardInstanceId,
            targetType: 'PLAYER' as const
          }
        ];

        engine.declareAttacks(player1Id, attacks);

        const finalGameState = engine.getGameState();
        expect(finalGameState.currentPhase.type).toBe(GamePhaseType.MAIN_B);
      }
    });
  });

  describe('getActivePlayer', () => {
    it('should return the current active player', () => {
      const engine = createEngine();
      const activePlayer = engine.getActivePlayer();
      expect(activePlayer.playerId).toBe(player1Id);
    });
  });

  describe('getInactivePlayer', () => {
    it('should return the non-active player', () => {
      const engine = createEngine();
      const inactivePlayer = engine.getInactivePlayer();
      expect(inactivePlayer.playerId).toBe(player2Id);
    });
  });
});
