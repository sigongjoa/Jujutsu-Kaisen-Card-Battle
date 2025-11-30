/**
 * Game Engine - Core game logic for Jujutsu Kaisen Card Battle
 */

import {
  GameState,
  PlayerGameState,
  GamePhaseType,
  GamePhase,
  CardInstance,
  CardData,
  GameAction,
  GameActionType,
  CardLocation,
  EffectPayload,
  CardAbility,
  TriggerCondition,
  EffectType,
  StackEntry
} from '../types';
import { CardService, cardService } from './CardService';
import { v4 as uuidv4 } from 'uuid';

export class GameEngine {
  private gameState: GameState;
  private cardService: CardService;

  constructor(gameId: string, matchId: string, player1Id: string, player2Id: string) {
    this.cardService = cardService;

    this.gameState = {
      gameId,
      matchId,
      status: 'WAITING',
      createdAt: new Date(),

      players: {
        [player1Id]: this.createPlayerState(player1Id, 'Player1'),
        [player2Id]: this.createPlayerState(player2Id, 'Player2')
      },

      currentTurn: 0,
      currentPhase: {
        type: GamePhaseType.RECHARGE,
        step: 0,
        priority: 'ACTIVE'
      },
      currentPlayerIndex: 0,

      stack: [],
      history: []
    };
  }

  /**
   * Create initial player state
   */
  private createPlayerState(playerId: string, username: string): PlayerGameState {
    return {
      playerId,
      username,
      currentHp: 20,
      maxHp: 20,
      currentCursedEnergy: 0,
      maxCursedEnergy: 1,

      deck: [],
      hand: [],
      field: [],
      graveyard: [],
      banished: [],

      isPriority: false,
      hasResponded: false,
      passCount: 0,
      statusEffects: [],
      damageReduction: 0,
      evasionUsed: false
    };
  }

  /**
   * Get current game state
   */
  getGameState(): GameState {
    return this.gameState;
  }

  /**
   * Get active player
   */
  getActivePlayer(): PlayerGameState {
    const playerIds = Object.keys(this.gameState.players);
    return this.gameState.players[playerIds[this.gameState.currentPlayerIndex]];
  }

  /**
   * Get inactive player
   */
  getInactivePlayer(): PlayerGameState {
    const playerIds = Object.keys(this.gameState.players);
    const inactiveIndex = 1 - this.gameState.currentPlayerIndex;
    return this.gameState.players[playerIds[inactiveIndex]];
  }

  /**
   * Start the game
   */
  startGame(): void {
    this.gameState.status = 'IN_PROGRESS';
    this.gameState.startedAt = new Date();
    this.gameState.currentTurn = 1;

    // Initialize player decks with sample cards
    const playerIds = Object.keys(this.gameState.players);
    for (const playerId of playerIds) {
      const deck = this.gameState.players[playerId].deck;
      // Add 40 cards to deck (simplified - just add same cards multiple times)
      for (let i = 0; i < 40; i++) {
        const cardId = i % 3 === 0 ? 'JK-001-YUJI' : i % 3 === 1 ? 'JK-020-GOJO' : 'JK-050-GREAT-WIND';
        deck.push(this.cardService.createCardInstance(cardId, playerId, CardLocation.DECK));
      }

      // Shuffle deck (simplified)
      this.shuffleArray(deck);
    }

    this.startTurn();
  }

  /**
   * Start a new turn
   */
  private startTurn(): void {
    if (this.gameState.currentTurn > 1) {
      this.endTurn();
    }

    const activePlayer = this.getActivePlayer();
    this.gameState.currentPhase = {
      type: GamePhaseType.RECHARGE,
      step: 0,
      priority: 'ACTIVE'
    };

    // Recharge phase
    this.executeRechargePhase();
  }

  /**
   * Execute recharge phase
   */
  private executeRechargePhase(): void {
    const player = this.getActivePlayer();

    // Restore cursed energy
    player.currentCursedEnergy = player.maxCursedEnergy;

    // Increase max CE each turn (capped at 8)
    if (player.maxCursedEnergy < 8) {
      player.maxCursedEnergy += 1;
    }

    // Clear temporary modifiers
    this.clearTemporaryModifiers(player);

    // Trigger RECHARGE phase abilities
    this.triggerAbilitiesByTrigger(player, TriggerCondition.ON_TURN_START);

    // Move to draw phase
    this.gameState.currentPhase = {
      type: GamePhaseType.DRAW,
      step: 0,
      priority: 'ACTIVE'
    };

    this.executeDrawPhase();
  }

  /**
   * Execute draw phase
   */
  private executeDrawPhase(): void {
    const player = this.getActivePlayer();

    if (player.deck.length > 0) {
      const drawnCard = player.deck.shift()!;
      drawnCard.location = CardLocation.HAND;
      player.hand.push(drawnCard);
    } else {
      // Deck empty: lose 2 HP
      this.applyDamage(player, 2, 'DECK_EMPTY');
    }

    // Trigger DRAW phase abilities
    this.triggerAbilitiesByTrigger(player, TriggerCondition.ON_DRAW);

    // Move to MAIN_A phase
    this.gameState.currentPhase = {
      type: GamePhaseType.MAIN_A,
      step: 0,
      priority: 'ACTIVE'
    };
  }

  /**
   * Play a card from hand
   */
  playCard(playerId: string, cardInstanceId: string, targetIds: string[] = []): { success: boolean; error?: string } {
    const player = this.gameState.players[playerId];
    if (!player) {
      return { success: false, error: 'PLAYER_NOT_FOUND' };
    }

    // Find card in hand
    const cardIndex = player.hand.findIndex(c => c.cardInstanceId === cardInstanceId);
    if (cardIndex === -1) {
      return { success: false, error: 'CARD_NOT_IN_HAND' };
    }

    const cardInstance = player.hand[cardIndex];
    const cardData = this.cardService.getCard(cardInstance.cardId);
    if (!cardData) {
      return { success: false, error: 'CARD_DATA_NOT_FOUND' };
    }

    // Check cost
    const cost = this.cardService.getCardCost(cardInstance, cardData);
    if (player.currentCursedEnergy < cost) {
      return { success: false, error: 'INSUFFICIENT_CE' };
    }

    // Remove from hand and add to field
    player.hand.splice(cardIndex, 1);
    cardInstance.location = CardLocation.FIELD;
    player.field.push(cardInstance);

    // Consume CE
    player.currentCursedEnergy -= cost;

    // Trigger ENTER_FIELD abilities
    this.triggerAbilityOnCard(cardInstance, TriggerCondition.ENTER_FIELD);

    // Record action
    this.recordAction('PLAY_CARD', playerId, cardInstanceId, targetIds);

    return { success: true };
  }

  /**
   * Declare attacks
   */
  declareAttacks(
    playerId: string,
    attacks: Array<{ attackerId: string; targetType: 'PLAYER' | 'CARD'; targetCardId?: string }>
  ): { success: boolean; error?: string } {
    const player = this.gameState.players[playerId];
    if (!player) {
      return { success: false, error: 'PLAYER_NOT_FOUND' };
    }

    for (const attack of attacks) {
      const attacker = player.field.find(c => c.cardInstanceId === attack.attackerId);
      if (!attacker) {
        return { success: false, error: `ATTACKER_NOT_FOUND: ${attack.attackerId}` };
      }

      // Resolve combat
      this.resolveCombat(player, attacker, attack.targetType, attack.targetCardId);
    }

    // Move to MAIN_B phase
    this.gameState.currentPhase = {
      type: GamePhaseType.MAIN_B,
      step: 0,
      priority: 'ACTIVE'
    };

    // Record action
    this.recordAction('DECLARE_ATTACKS', playerId);

    return { success: true };
  }

  /**
   * Resolve combat
   */
  private resolveCombat(attacker_player: PlayerGameState, attacker: CardInstance, targetType: 'PLAYER' | 'CARD', targetCardId?: string): void {
    const defender_player = this.getInactivePlayer();
    const attackerData = this.cardService.getCard(attacker.cardId);
    if (!attackerData) return;

    const attackerStats = this.cardService.getCardStats(attacker, attackerData);
    let damage = attackerStats.atk;

    // Tap attacker
    attacker.tappedStatus = true;

    if (targetType === 'PLAYER') {
      // Direct damage to player
      this.applyDamage(defender_player, damage, 'COMBAT');
    } else if (targetCardId) {
      // Block by card
      const defender = defender_player.field.find(c => c.cardInstanceId === targetCardId);
      if (defender) {
        const defenderData = this.cardService.getCard(defender.cardId);
        if (defenderData) {
          const defenderStats = this.cardService.getCardStats(defender, defenderData);

          // Check for Evasion
          if (this.cardService.hasKeyword(defenderData, 'Evasion') && !defender.statusEffects.find(e => e.type === 'EVASION_USED')) {
            damage = 0;
            defender.statusEffects.push({
              effectId: uuidv4(),
              type: 'EVASION_USED' as any,
              duration: 1,
              source: attacker.cardId
            });
          }

          // Check for Piercing
          if (!this.cardService.hasKeyword(attackerData, 'Piercing')) {
            // Apply damage reduction from defender
            damage = Math.max(1, damage - Math.floor(defenderStats.def / 2));
          }

          // Apply damage
          this.applyDamage(defender, damage, 'COMBAT');
        }
      }
    }
  }

  /**
   * Apply damage
   */
  private applyDamage(target: PlayerGameState | CardInstance, amount: number, source: string): void {
    if (target instanceof Object && 'currentHp' in target && 'maxHp' in target) {
      // Player damage
      const player = target as PlayerGameState;
      player.currentHp = Math.max(0, player.currentHp - amount);

      if (player.currentHp <= 0) {
        this.endGame(this.getInactivePlayer().playerId, 'OPPONENT_HP_ZERO');
      }
    } else if (target instanceof Object && 'currentHp' in target) {
      // Card damage
      const card = target as CardInstance;
      if (card.currentHp !== undefined) {
        card.currentHp -= amount;

        if (card.currentHp <= 0) {
          this.destroyCard(card);
        }
      }
    }
  }

  /**
   * Destroy a card
   */
  private destroyCard(card: CardInstance): void {
    const player = this.gameState.players[card.ownerId];
    if (!player) return;

    const fieldIndex = player.field.findIndex(c => c.cardInstanceId === card.cardInstanceId);
    if (fieldIndex !== -1) {
      const destroyedCard = player.field.splice(fieldIndex, 1)[0];
      destroyedCard.location = CardLocation.GRAVEYARD;
      player.graveyard.push(destroyedCard);
    }
  }

  /**
   * End turn
   */
  private endTurn(): void {
    const player = this.getActivePlayer();

    // Clear temporary modifiers
    this.clearTemporaryModifiers(player);

    // Clear evasion counters
    player.evasionUsed = false;

    // Untap all cards
    for (const card of player.field) {
      card.tappedStatus = false;
    }

    // Hand size enforcement
    while (player.hand.length > 10) {
      player.hand.shift(); // Simplified: just remove from hand
    }

    // Move to next player's turn
    this.gameState.currentPlayerIndex = 1 - this.gameState.currentPlayerIndex;
    this.gameState.currentTurn += 1;

    this.startTurn();
  }

  /**
   * Pass priority
   */
  passAction(playerId: string): void {
    this.recordAction('PASS', playerId);
  }

  /**
   * Surrender
   */
  surrender(playerId: string): void {
    const opponent = Object.keys(this.gameState.players).find(id => id !== playerId);
    if (opponent) {
      this.endGame(opponent, 'SURRENDER');
    }
  }

  /**
   * Trigger abilities by trigger condition
   */
  private triggerAbilitiesByTrigger(player: PlayerGameState, triggerCondition: TriggerCondition): void {
    for (const card of player.field) {
      this.triggerAbilityOnCard(card, triggerCondition);
    }
  }

  /**
   * Trigger ability on a specific card
   */
  private triggerAbilityOnCard(cardInstance: CardInstance, triggerCondition: TriggerCondition): void {
    const cardData = this.cardService.getCard(cardInstance.cardId);
    if (!cardData) return;

    for (const ability of cardData.abilities) {
      if (ability.type === 'PASSIVE' || (ability.triggerCondition === triggerCondition && ability.type === 'TRIGGERED')) {
        this.resolveAbility(cardInstance, ability);
      }
    }
  }

  /**
   * Resolve an ability
   */
  private resolveAbility(cardInstance: CardInstance, ability: CardAbility): void {
    const effect = ability.effect;
    const cardData = this.cardService.getCard(cardInstance.cardId);
    if (!cardData) return;

    const sourcePlayer = this.gameState.players[cardInstance.ownerId];
    const targetPlayer = this.getInactivePlayer();

    switch (effect.type) {
      case EffectType.DAMAGE:
        if (effect.target === 'ENEMY' || effect.target === 'PLAYER') {
          this.applyDamage(targetPlayer, effect.value || 0, cardInstance.cardId);
        }
        break;

      case EffectType.HEAL:
        if (effect.target === 'SELF') {
          sourcePlayer.currentHp = Math.min(sourcePlayer.maxHp, sourcePlayer.currentHp + (effect.value || 0));
        }
        break;

      case EffectType.DRAW:
        if (sourcePlayer.deck.length > 0 && (effect.value || 0) > 0) {
          for (let i = 0; i < effect.value!; i++) {
            if (sourcePlayer.deck.length > 0) {
              const drawnCard = sourcePlayer.deck.shift()!;
              drawnCard.location = CardLocation.HAND;
              sourcePlayer.hand.push(drawnCard);
            }
          }
        }
        break;

      case EffectType.MODIFY_STAT:
        if (effect.target === 'SELF') {
          sourcePlayer.field.forEach(card => {
            if (card.cardInstanceId === cardInstance.cardInstanceId) {
              // Apply modifier to card itself
              // Simplified implementation
            }
          });
        }
        break;
    }
  }

  /**
   * Clear temporary modifiers for a player
   */
  private clearTemporaryModifiers(player: PlayerGameState): void {
    for (const card of [...player.field, ...player.hand]) {
      card.modifiers = card.modifiers.filter(m => m.duration !== 'UNTIL_END_OF_TURN');
    }
  }

  /**
   * End the game
   */
  private endGame(winnerId: string, winCondition: string): void {
    this.gameState.status = 'COMPLETED';
    this.gameState.endedAt = new Date();
    this.gameState.winner = winnerId;
    this.gameState.winCondition = winCondition;
  }

  /**
   * Record an action in game history
   */
  private recordAction(actionType: GameActionType, playerId: string, cardInstanceId?: string, targetIds: string[] = []): void {
    this.gameState.history.push({
      actionId: uuidv4(),
      type: actionType,
      playerId,
      timestamp: Date.now(),
      cardInstanceId,
      targetIds
    });
  }

  /**
   * Shuffle array (Fisher-Yates)
   */
  private shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}
