/**
 * Game Engine tests
 */

import { GameEngine } from '../services/GameEngine';
import { GamePhaseType } from '../types';

describe('GameEngine', () => {
  let engine: GameEngine;
  const player1Id = 'player-1';
  const player2Id = 'player-2';

  beforeEach(() => {
    engine = new GameEngine('game-1', 'match-1', player1Id, player2Id);
  });

  describe('initialization', () => {
    it('should create game with initial state', () => {
      const gameState = engine.getGameState();

      expect(gameState.gameId).toBe('game-1');
      expect(gameState.matchId).toBe('match-1');
      expect(gameState.status).toBe('WAITING');
      expect(gameState.players[player1Id]).toBeDefined();
      expect(gameState.players[player2Id]).toBeDefined();
    });

    it('should initialize players with correct HP', () => {
      const gameState = engine.getGameState();
      expect(gameState.players[player1Id].currentHp).toBe(20);
      expect(gameState.players[player2Id].currentHp).toBe(20);
    });
  });

  describe('startGame', () => {
    it('should transition from WAITING to IN_PROGRESS', () => {
      engine.startGame();
      const gameState = engine.getGameState();
      expect(gameState.status).toBe('IN_PROGRESS');
      expect(gameState.startedAt).toBeDefined();
    });

    it('should initialize player decks', () => {
      engine.startGame();
      const gameState = engine.getGameState();

      expect(gameState.players[player1Id].deck.length).toBeGreaterThan(0);
      expect(gameState.players[player2Id].deck.length).toBeGreaterThan(0);
    });

    it('should start with RECHARGE phase', () => {
      engine.startGame();
      const gameState = engine.getGameState();

      expect(gameState.currentPhase.type).toBe(GamePhaseType.RECHARGE);
    });
  });

  describe('playCard', () => {
    beforeEach(() => {
      engine.startGame();
    });

    it('should move card from hand to field', () => {
      const gameState = engine.getGameState();
      const player = gameState.players[player1Id];

      if (player.hand.length > 0) {
        const cardInstanceId = player.hand[0].cardInstanceId;
        const result = engine.playCard(player1Id, cardInstanceId);

        expect(result.success).toBe(true);

        const updatedGameState = engine.getGameState();
        const updatedPlayer = updatedGameState.players[player1Id];

        // Card should no longer be in hand
        expect(updatedPlayer.hand.find(c => c.cardInstanceId === cardInstanceId)).toBeUndefined();

        // Card should be in field
        expect(updatedPlayer.field.find(c => c.cardInstanceId === cardInstanceId)).toBeDefined();
      }
    });

    it('should consume cursed energy', () => {
      const gameState = engine.getGameState();
      const player = gameState.players[player1Id];
      const initialCE = player.currentCursedEnergy;

      if (player.hand.length > 0) {
        const cardInstanceId = player.hand[0].cardInstanceId;
        engine.playCard(player1Id, cardInstanceId);

        const updatedGameState = engine.getGameState();
        const updatedPlayer = updatedGameState.players[player1Id];

        expect(updatedPlayer.currentCursedEnergy).toBeLessThan(initialCE);
      }
    });

    it('should fail if card not in hand', () => {
      const result = engine.playCard(player1Id, 'non-existent-card');
      expect(result.success).toBe(false);
      expect(result.error).toBe('CARD_NOT_IN_HAND');
    });
  });

  describe('declareAttacks', () => {
    beforeEach(() => {
      engine.startGame();
      // Add a card to field
      const gameState = engine.getGameState();
      const player = gameState.players[player1Id];
      if (player.hand.length > 0) {
        engine.playCard(player1Id, player.hand[0].cardInstanceId);
      }
    });

    it('should move to MAIN_B phase after declaring attacks', () => {
      const gameState = engine.getGameState();
      const player = gameState.players[player1Id];

      if (player.field.length > 0) {
        const attacks = [
          {
            attackerId: player.field[0].cardInstanceId,
            targetType: 'PLAYER' as const
          }
        ];

        engine.declareAttacks(player1Id, attacks);

        const updatedGameState = engine.getGameState();
        expect(updatedGameState.currentPhase.type).toBe(GamePhaseType.MAIN_B);
      }
    });
  });

  describe('getActivePlayer', () => {
    it('should return the current active player', () => {
      const activePlayer = engine.getActivePlayer();
      expect(activePlayer.playerId).toBe(player1Id);
    });
  });

  describe('getInactivePlayer', () => {
    it('should return the non-active player', () => {
      const inactivePlayer = engine.getInactivePlayer();
      expect(inactivePlayer.playerId).toBe(player2Id);
    });
  });
});
