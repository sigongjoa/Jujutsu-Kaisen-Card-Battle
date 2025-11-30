# TDD 08: Server Game Logic (서버 게임 로직)

**Document Type**: Technical Design Document
**Status**: Active
**Last Updated**: 2025-11-30
**Target Audience**: Backend Developers, Game Servers Engineers, QA Engineers

---

## 1. Overview

This document specifies the complete server-side game logic for Jujutsu Kaisen Card Battle. The server is the authority for all game state transitions, card effects resolution, combat calculations, and turn processing. All clients are stateless and receive game state updates via WebSocket.

### 1.1 Core Architecture Principles

- **Server-Authoritative**: All game logic executes on server only
- **Deterministic**: Same input always produces same output (for replays)
- **Atomic Transactions**: Turn/action completion is all-or-nothing
- **Concurrent-Safe**: Multiple games running simultaneously without interference
- **Verifiable**: All client actions validated before execution

## 2. Game State Management

### 2.1 GameState Data Structure

```typescript
interface GameState {
  gameId: string;
  matchId: string;
  status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED';
  createdAt: Date;
  startedAt?: Date;
  endedAt?: Date;

  // Player information
  players: {
    [playerId: string]: PlayerState;
  };

  // Current turn information
  currentTurn: number;
  currentPhase: GamePhase;
  currentPlayerIndex: number;

  // Global game state
  stack: CardEffect[];
  history: GameAction[];
  activeAbilities: Set<string>;
  timingWindow: TimingWindow;

  // Victory condition
  winner?: string;
  winCondition?: 'OPPONENT_HP_ZERO' | 'DECK_EMPTY' | 'SURRENDER' | 'TIMEOUT';
}

interface PlayerState {
  playerId: string;
  username: string;
  currentHp: number;
  maxHp: number;
  currentCursedEnergy: number;
  maxCursedEnergy: number;

  // Card locations
  deck: Card[];
  hand: Card[];
  field: Card[];
  graveyard: Card[];
  banished: Card[];

  // Player-specific state
  isPriority: boolean;
  hasResponded: boolean;
  passCount: number;

  // Status effects
  statusEffects: StatusEffect[];
  damageReduction: number; // Flat reduction (0 unless modified)
  evasionUsed: boolean; // Can only evade once per turn

  // Deck list (for game start)
  deckList: DeckListItem[];
}

interface GamePhase {
  type: 'RECHARGE' | 'DRAW' | 'MAIN_A' | 'BATTLE' | 'MAIN_B' | 'END';
  step: number; // Sub-steps within phase
  priority: 'ACTIVE' | 'INACTIVE';
}

interface Card {
  cardId: string;
  instanceId: string; // Unique for each card in play
  ownerId: string;
  location: CardLocation;
  position: 'FACE_UP' | 'FACE_DOWN'; // Face-down for hidden cards
  tappedStatus?: boolean;
  counters: { [counterType: string]: number };
  attachments: string[]; // Equipment cards attached
  modifiers: CardModifier[];
  statusEffects: StatusEffect[];
}

interface CardModifier {
  modifierId: string;
  source: string; // Card that applied modifier
  type: 'STAT_BOOST' | 'STAT_REDUCTION' | 'KEYWORD_GRANT' | 'ABILITY_GRANT';
  stat?: 'ATK' | 'DEF';
  value?: number;
  duration: 'PERMANENT' | 'UNTIL_END_OF_TURN' | 'UNTIL_EOL'; // End of life
  isActive: boolean;
}

interface StatusEffect {
  effectId: string;
  type: 'STUN' | 'POISON' | 'CURSED_SEAL' | 'WEAKNESS' | 'CUSTOM';
  value?: number;
  duration: number; // Turns remaining
  source: string; // Card that applied effect
}
```

### 2.2 Game State Persistence

**Redis Cache** (Hot data):
```javascript
// Game state cached in Redis with 30-minute TTL
redis.set(`game:${gameId}`, JSON.stringify(gameState), 'EX', 1800);

// Each player has reference to game
redis.hset(`player:${playerId}:games`, gameId, timestamp);
```

**PostgreSQL** (Permanent record):
```sql
-- Games table
CREATE TABLE games (
  game_id VARCHAR(36) PRIMARY KEY,
  match_id VARCHAR(36) NOT NULL,
  player_one_id UUID NOT NULL,
  player_two_id UUID NOT NULL,
  winner_id UUID,
  status VARCHAR(20),
  final_state JSONB, -- Complete final state snapshot
  game_log JSONB, -- All actions in order
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Game log for replay
CREATE TABLE game_logs (
  log_id SERIAL PRIMARY KEY,
  game_id VARCHAR(36) NOT NULL REFERENCES games(game_id),
  turn_number INT,
  phase VARCHAR(20),
  action_index INT,
  action JSONB, -- The GameAction
  state_before JSONB, -- Game state before action
  state_after JSONB, -- Game state after action
  timestamp TIMESTAMP DEFAULT NOW()
);
```

## 3. Turn Processing

### 3.1 Full Turn Cycle (10-15 seconds per turn)

```
TURN START:
├─ Recharge Phase (1-2s)
│  ├─ Restore Cursed Energy to max
│  ├─ Clear temporary modifiers
│  └─ Trigger RECHARGE phase abilities
├─ Draw Phase (1-2s)
│  ├─ Draw 1 card from deck
│  ├─ Check deck empty condition
│  └─ Trigger DRAW phase abilities
└─ Transition to MAIN_A

MAIN_A PHASE (Active player):
├─ Player can play cards (cost ≤ current CE)
├─ Player can activate abilities
├─ Abilities resolve immediately or join stack
└─ Pass priority when done, opponent gets RESPOND window

MAIN_A RESPONDS (Inactive player - 3s window):
├─ Player can play RESPONSE cards
├─ If response played, return to MAIN_A after response resolves
└─ If pass, continue to BATTLE PHASE

BATTLE PHASE (Active player):
├─ Declare attacks for each card with ATK > 0
├─ Opponent declares blocks
├─ Simultaneous combat resolution
├─ Calculate damage (with modifiers and keywords)
└─ Apply damage and trigger effects

MAIN_B PHASE (Active player):
├─ Another play window (cards/abilities)
├─ Different from MAIN_A (some cards only work in MAIN_B)
└─ Cannot attack in this phase

MAIN_B RESPONDS (Inactive player - 3s window):
├─ Response window like MAIN_A
└─ After pass, move to END PHASE

END PHASE (Automatic):
├─ Trigger END phase abilities
├─ Clear "until end of turn" modifiers
├─ Clear evasion counters
├─ Hand size enforcement (max 10 cards)
├─ Increment turn counter
└─ Pass turn to opponent

TOTAL TURN TIME: 10-20 seconds (configurable)
  - Per-action timeout: 1-3 seconds
  - Response window: 3 seconds
  - If player unresponsive: auto-pass
```

### 3.2 Turn State Machine

```
┌─────────────────────────────────────────────────────────┐
│                    GAME START                            │
│              Both players at 20 HP, 0 CE                │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              RECHARGE PHASE                              │
│  • Restore CE (0 → maxCE)                              │
│  • Trigger "on recharge" abilities                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│               DRAW PHASE                                │
│  • Draw 1 card from deck (or lose 2 HP if deck empty)  │
│  • Trigger "on draw" abilities                         │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│             MAIN_A PHASE (Active)                       │
│  • Play cards (cost ≤ current CE)                      │
│  • Activate abilities                                  │
│  • Pass priority when done                            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│         Response Window (Inactive) - 3s                │
│  • Play RESPONSE cards                                 │
│  • If response: go back to MAIN_A for active player   │
│  • If pass: continue                                   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│             BATTLE PHASE (Active)                       │
│  • Declare attacks                                     │
│  • Opponent declares blocks                            │
│  • Resolve combat                                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│             MAIN_B PHASE (Active)                       │
│  • Secondary play window                               │
│  • Cannot attack in MAIN_B                             │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│         Response Window (Inactive) - 3s                │
│  • Final response opportunity                          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              END PHASE (Automatic)                       │
│  • Trigger "on end turn" abilities                     │
│  • Clear "until EOT" modifiers                         │
│  • Enforce hand size (max 10)                          │
│  • Clear evasion counters                              │
│  • Pass priority to opponent                           │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
               [Go to opponent's RECHARGE]
```

### 3.3 Turn Processing Algorithm

```python
def process_turn(game_state, active_player_id):
    """
    Main turn processing loop.
    Returns: Updated game_state or error
    """
    game = game_state

    # === RECHARGE PHASE ===
    game.current_phase = GamePhase('RECHARGE', 0)
    player = game.players[active_player_id]

    # Restore Cursed Energy
    player.current_cursed_energy = player.max_cursed_energy

    # Trigger RECHARGE abilities
    for card in player.field:
        if has_ability(card, RECHARGE_TRIGGER):
            resolve_ability(game, card, RECHARGE_TRIGGER)

    # === DRAW PHASE ===
    game.current_phase = GamePhase('DRAW', 0)

    if len(player.deck) > 0:
        drawn_card = player.deck.pop(0)
        player.hand.append(drawn_card)
        broadcast_event(game, 'CARD_DRAWN', drawn_card)
    else:
        # Deck empty: lose 2 HP
        apply_damage(game, player, 2, source='DECK_EMPTY')
        broadcast_event(game, 'PLAYER_DECK_EMPTY', player)

    # Trigger DRAW abilities
    for card in player.field:
        if has_ability(card, DRAW_TRIGGER):
            resolve_ability(game, card, DRAW_TRIGGER)

    # === MAIN_A PHASE ===
    game.current_phase = GamePhase('MAIN_A', 0)
    game.current_priority = 'ACTIVE'

    while True:
        action = wait_for_player_action(game, active_player_id, timeout=10)

        if action.type == 'PLAY_CARD':
            result = validate_and_play_card(game, active_player_id, action)
            if result.success:
                broadcast_event(game, 'CARD_PLAYED', result.card)
            else:
                broadcast_error(game, active_player_id, result.error)

        elif action.type == 'ACTIVATE_ABILITY':
            result = validate_and_activate(game, active_player_id, action)
            if result.success:
                resolve_ability(game, action.card, action.ability)
                broadcast_event(game, 'ABILITY_ACTIVATED', action)
            else:
                broadcast_error(game, active_player_id, result.error)

        elif action.type == 'PASS':
            break

        elif action.type == 'SURRENDER':
            return end_game(game, winner=opponent_id(game, active_player_id))

    # === RESPONSE WINDOW (Opponent) ===
    game.current_priority = 'INACTIVE'
    opponent_id = get_opponent(game, active_player_id)

    response_window = start_response_window(game, timeout=3)

    if response_window.responses:
        # Process responses
        for response in response_window.responses:
            resolve_response(game, opponent_id, response)
        # Return to MAIN_A for active player
        continue_main_a(game, active_player_id)

    # === BATTLE PHASE ===
    game.current_phase = GamePhase('BATTLE', 0)

    attacks = wait_for_attack_declaration(game, active_player_id)
    blocks = wait_for_block_declaration(game, opponent_id, attacks)

    for attack in attacks:
        resolve_combat(game, attack, blocks.get(attack.card_id))

    # === MAIN_B PHASE ===
    game.current_phase = GamePhase('MAIN_B', 0)
    # Similar to MAIN_A but cards with MAIN_B restriction only work here

    # === RESPONSE WINDOW (Final) ===
    final_responses = start_response_window(game, timeout=3)
    if final_responses.responses:
        for response in final_responses.responses:
            resolve_response(game, opponent_id, response)

    # === END PHASE ===
    game.current_phase = GamePhase('END', 0)

    # Trigger END abilities
    for card in player.field:
        if has_ability(card, END_TRIGGER):
            resolve_ability(game, card, END_TRIGGER)

    # Clear modifiers
    clear_temporary_modifiers(player)

    # Hand size enforcement
    if len(player.hand) > 10:
        # Player must discard down to 10
        discarded = wait_for_discard(game, active_player_id, len(player.hand) - 10)
        for card in discarded:
            move_card(game, card, 'GRAVEYARD')

    # Clear evasion counters
    for card in opponent.field:
        card.evasion_used = False

    game.current_turn += 1
    return game
```

## 4. Card Play and Validation

### 4.1 Card Play Validation

```typescript
interface PlayCardAction {
  cardInstanceId: string;
  targetIds?: string[]; // Optional targets for effects
  x?: number; // For X-cost abilities
}

interface PlayCardResult {
  success: boolean;
  error?: string;
  consumedCE?: number;
  cardsAffected?: string[];
}

function validateAndPlayCard(
  game: GameState,
  playerId: string,
  action: PlayCardAction
): PlayCardResult {
  const card = findCard(game, action.cardInstanceId);
  const player = game.players[playerId];

  // === Validation Checks ===

  // 1. Card exists and belongs to player
  if (!card || card.ownerId !== playerId) {
    return { success: false, error: 'CARD_NOT_FOUND' };
  }

  // 2. Card is in hand
  if (card.location !== 'HAND') {
    return { success: false, error: 'CARD_NOT_IN_HAND' };
  }

  // 3. Card is face-up
  if (card.position === 'FACE_DOWN') {
    return { success: false, error: 'CARD_FACE_DOWN' };
  }

  // 4. Correct game phase
  const cardType = getCardMetadata(card).type;
  if (cardType === 'RESPONSE' && game.currentPhase.type !== 'RESPONSE_WINDOW') {
    return { success: false, error: 'WRONG_PHASE' };
  }

  // 5. Sufficient Cursed Energy
  const cardCost = calculateCardCost(card);
  if (player.currentCursedEnergy < cardCost) {
    return { success: false, error: 'INSUFFICIENT_CE' };
  }

  // 6. Target validation (if applicable)
  if (action.targetIds) {
    const targetValidation = validateTargets(game, card, action.targetIds);
    if (!targetValidation.success) {
      return { success: false, error: targetValidation.error };
    }
  }

  // 7. Restrictions check (e.g., "Can only play once per turn")
  if (!checkRestrictions(game, card)) {
    return { success: false, error: 'RESTRICTION_VIOLATED' };
  }

  // === Execute Play ===

  // Consume CE
  player.currentCursedEnergy -= cardCost;

  // Move card to field
  moveCard(game, card, 'FIELD', action);

  // Trigger enter-field abilities
  const enterAbilities = getAbilitiesByTrigger(card, 'ENTER_FIELD');
  for (const ability of enterAbilities) {
    resolveAbility(game, card, ability, {
      targets: action.targetIds,
      x: action.x
    });
  }

  // Broadcast event
  broadcastEvent(game, 'CARD_PLAYED', {
    card: card,
    player: playerId,
    cost: cardCost,
    targets: action.targetIds
  });

  // Check for win conditions
  if (isGameEnded(game)) {
    return { success: true, gameEnded: true };
  }

  return { success: true, consumedCE: cardCost };
}
```

### 4.2 Card Cost Calculation

```typescript
function calculateCardCost(card: Card, context?: GameState): number {
  const metadata = getCardMetadata(card);
  let cost = metadata.baseCost;

  // Apply modifiers from player or other sources
  for (const modifier of card.modifiers) {
    if (modifier.type === 'COST_REDUCTION' && modifier.isActive) {
      cost = Math.max(0, cost - modifier.value);
    }
    if (modifier.type === 'COST_INCREASE' && modifier.isActive) {
      cost += modifier.value;
    }
  }

  return cost;
}
```

## 5. Combat System

### 5.1 Attack Declaration

```typescript
interface Attack {
  attacker: Card;
  target: 'PLAYER' | 'CARD';
  targetCard?: Card;
}

function waitForAttackDeclaration(
  game: GameState,
  playerId: string,
  timeout: number = 5
): Attack[] {
  const player = game.players[playerId];
  const validAttackers = player.field.filter(card => {
    const stats = getCardStats(card, game);
    return stats.atk > 0 && !card.tappedStatus;
  });

  const attacks: Attack[] = [];

  // Wait for player input or timeout
  const action = waitForPlayerInput(game, playerId, timeout);

  if (action.type === 'DECLARE_ATTACKS') {
    for (const attackData of action.attacks) {
      const attacker = findCard(game, attackData.attackerId);
      if (!validAttackers.includes(attacker)) {
        return { error: 'INVALID_ATTACKER' };
      }

      attacks.push({
        attacker: attacker,
        target: attackData.targetType,
        targetCard: attackData.targetCardId ? findCard(game, attackData.targetCardId) : undefined
      });
    }
  }
  // If timeout or pass, attacks array is empty

  return attacks;
}
```

### 5.2 Combat Resolution

```typescript
function resolveCombat(game: GameState, attack: Attack, block?: Card): void {
  const attacker = attack.attacker;
  const defender = attack.targetCard;

  // Get current stats with modifiers
  const attackerStats = getCardStats(attacker, game);
  const defenderStats = defender ? getCardStats(defender, game) : null;

  let damage = attackerStats.atk;
  let actualDamage = damage;

  // === Handle blocking ===
  if (block) {
    // Both attacker and blocker take damage
    const blockStats = getCardStats(block, game);
    const blockDamage = blockStats.atk;

    // Apply damage to attacker
    applyDamage(game, attacker, blockDamage, {
      source: block,
      type: 'COMBAT_DAMAGE'
    });

    // Apply damage to defender
    actualDamage = damage; // Defender takes full damage even with block
  }

  // === Check for Piercing ===
  if (hasKeyword(attacker, 'PIERCING')) {
    // Ignore Evasion
  }

  // === Handle Evasion ===
  if (defender && hasKeyword(defender, 'EVASION') && !defender.evasionUsed) {
    actualDamage = 0;
    defender.evasionUsed = true;
    broadcastEvent(game, 'EVASION_TRIGGERED', { card: defender });
  }

  // === Calculate final damage ===
  const defenderDamageReduction = defender?.damageReduction || 0;
  actualDamage = Math.max(1, actualDamage - defenderDamageReduction);

  // === Apply damage ===
  if (attack.target === 'PLAYER') {
    applyDamage(game, game.players[defender.ownerId], actualDamage, {
      source: attacker,
      type: 'COMBAT_DAMAGE'
    });
  } else if (defender) {
    applyDamage(game, defender, actualDamage, {
      source: attacker,
      type: 'COMBAT_DAMAGE'
    });
  }

  // === Trigger combat abilities ===
  const combatAbilities = getAbilitiesByTrigger(attacker, 'DEAL_DAMAGE');
  for (const ability of combatAbilities) {
    resolveAbility(game, attacker, ability, { damage: actualDamage });
  }

  // === Check for card destruction ===
  if (defender && defender.currentHp <= 0) {
    destroyCard(game, defender);
  }

  // === Tap attacker ===
  attacker.tappedStatus = true;
}
```

### 5.3 Damage Application

```typescript
interface DamageApplication {
  source: Card | Player;
  amount: number;
  type: 'COMBAT' | 'ABILITY' | 'EFFECT' | 'DECK_EMPTY';
}

function applyDamage(
  game: GameState,
  target: Card | Player,
  amount: number,
  application: DamageApplication
): void {
  // === Damage reduction modifiers ===
  let reducedDamage = amount;

  if (target instanceof Player) {
    // Check for Indestructible (only for cards)
    // Apply damage reduction
    reducedDamage = Math.max(0, amount - target.damageReduction);

    // === Apply Lifelink ===
    if (application.source instanceof Card && hasKeyword(application.source, 'LIFELINK')) {
      const lifegain = Math.min(3, reducedDamage); // Max 3 per turn
      applyHealing(game, game.players[application.source.ownerId], lifegain);
    }

    target.currentHp -= reducedDamage;

    if (target.currentHp <= 0) {
      broadcastEvent(game, 'PLAYER_DEFEATED', { player: target, damage: reducedDamage });
    }
  } else if (target instanceof Card) {
    // Check for Indestructible
    if (hasKeyword(target, 'INDESTRUCTIBLE')) {
      // Damage but no destruction
      target.currentHp -= reducedDamage;
    } else {
      target.currentHp -= reducedDamage;
      if (target.currentHp <= 0) {
        destroyCard(game, target);
      }
    }
  }

  broadcastEvent(game, 'DAMAGE_APPLIED', {
    target: target,
    amount: amount,
    reducedDamage: reducedDamage,
    source: application.source
  });
}
```

## 6. Ability Resolution

### 6.1 Ability Types and Resolution

```typescript
enum AbilityType {
  PASSIVE = 'PASSIVE',      // Always active
  TRIGGERED = 'TRIGGERED',  // Triggers on condition
  ACTIVATED = 'ACTIVATED'   // Player chooses to activate (costs CE)
}

interface Ability {
  abilityId: string;
  name: string;
  type: AbilityType;
  triggerCondition?: string;
  cost?: number;
  effect: EffectPayload;
  timing: 'IMMEDIATE' | 'STACK' | 'RESPONSE';
  priority: number;
  repeatable: boolean;
  maxRepeatPerTurn?: number;
}

function resolveAbility(
  game: GameState,
  card: Card,
  ability: Ability,
  context?: any
): void {
  // === Check ability can be activated ===
  if (ability.type === 'ACTIVATED') {
    const player = game.players[card.ownerId];
    if (!player || player.currentCursedEnergy < ability.cost) {
      throw new Error('INSUFFICIENT_CE');
    }
    player.currentCursedEnergy -= ability.cost;
  }

  // === Check repeatable limit ===
  if (ability.repeatable && ability.maxRepeatPerTurn) {
    const timesActivatedThisTurn = countAbilityActivations(game, ability.abilityId);
    if (timesActivatedThisTurn >= ability.maxRepeatPerTurn) {
      throw new Error('ABILITY_LIMIT_EXCEEDED');
    }
  }

  // === Resolve effect ===
  resolveEffect(game, card, ability.effect, context);

  // === Broadcast ===
  broadcastEvent(game, 'ABILITY_RESOLVED', {
    card: card,
    ability: ability,
    effect: ability.effect
  });
}

function resolveEffect(
  game: GameState,
  source: Card,
  effect: EffectPayload,
  context?: any
): void {
  switch (effect.type) {
    case 'DAMAGE':
      for (const target of resolveTargets(game, effect.target, context)) {
        applyDamage(game, target, effect.value, { source });
      }
      break;

    case 'HEAL':
      for (const target of resolveTargets(game, effect.target, context)) {
        applyHealing(game, target, effect.value);
      }
      break;

    case 'DRAW':
      const player = game.players[source.ownerId];
      for (let i = 0; i < effect.value; i++) {
        if (player.deck.length > 0) {
          const card = player.deck.shift();
          player.hand.push(card);
        }
      }
      break;

    case 'MODIFY_STAT':
      applyModifier(game, source, effect);
      break;

    case 'DESTROY':
      for (const target of resolveTargets(game, effect.target, context)) {
        destroyCard(game, target);
      }
      break;

    // ... more effect types
  }
}
```

## 7. Stack and Priority System

### 7.1 Priority and Stack

```typescript
interface StackEntry {
  entryId: string;
  source: Card;
  ability: Ability;
  targets: Card[];
  priority: number;
  resolveAt: number; // Timestamp
  controller: string; // Player who controls this ability
}

class Stack {
  entries: StackEntry[] = [];

  push(entry: StackEntry): void {
    this.entries.push(entry);
    this.entries.sort((a, b) => b.priority - a.priority); // Higher priority first
  }

  pop(): StackEntry {
    return this.entries.pop(); // LIFO order
  }

  resolve(game: GameState): void {
    while (this.entries.length > 0) {
      const entry = this.pop();
      resolveAbility(game, entry.source, entry.ability);

      // Check for new entries added during resolution
      // (Some effects trigger other effects)
      if (this.entries.length === 0) {
        break;
      }
    }
  }
}
```

### 7.2 Simultaneous Effects

**Situation**: Multiple abilities trigger at the same time (same trigger condition).

**Resolution**:
1. **LIFO Order**: Last-In-First-Out (most recent ability resolves first)
2. **Priority Limit**: If same ability type repeats 3+ times, game ends in draw

```typescript
function checkInfiniteLoop(game: GameState, ability: Ability): boolean {
  const lastThreeEffects = game.stack.entries.slice(-3);

  if (lastThreeEffects.length === 3) {
    const allSame = lastThreeEffects.every(e => e.ability.abilityId === ability.abilityId);
    if (allSame) {
      // Infinite loop detected
      return true;
    }
  }

  return false;
}
```

## 8. Game End Conditions

### 8.1 Win Conditions

```typescript
enum WinCondition {
  OPPONENT_HP_ZERO = 'OPPONENT_HP_ZERO',      // Reduce opponent to 0 HP
  DECK_EMPTY = 'DECK_EMPTY',                  // Opponent draws from empty deck 3 times
  SURRENDER = 'SURRENDER',                    // Opponent surrenders
  TIMEOUT = 'TIMEOUT'                         // Opponent exceeds time limit
}

function checkGameEnd(game: GameState): GameEndResult {
  for (const playerId in game.players) {
    const player = game.players[playerId];
    const opponent = getOpponent(game, playerId);

    // Check HP zero
    if (player.currentHp <= 0) {
      return {
        ended: true,
        winner: opponent.playerId,
        condition: WinCondition.OPPONENT_HP_ZERO
      };
    }

    // Check deck empty (3 failures)
    if (player.deckEmptyCount >= 3) {
      return {
        ended: true,
        winner: opponent.playerId,
        condition: WinCondition.DECK_EMPTY
      };
    }
  }

  return { ended: false };
}
```

### 8.2 Game Recording

```typescript
async function recordGameEnd(game: GameState): Promise<void> {
  const pgClient = await pool.connect();

  try {
    // Insert game record
    await pgClient.query(
      `INSERT INTO games (game_id, match_id, player_one_id, player_two_id,
                          winner_id, status, final_state, game_log, started_at, ended_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        game.gameId,
        game.matchId,
        Object.keys(game.players)[0],
        Object.keys(game.players)[1],
        game.winner,
        'COMPLETED',
        JSON.stringify(game),
        JSON.stringify(game.history),
        game.startedAt,
        new Date()
      ]
    );

    // Update player statistics
    for (const playerId in game.players) {
      const isWinner = playerId === game.winner;
      await updatePlayerStats(pgClient, playerId, isWinner);
    }

    // Cache game in Redis for quick replay access
    await redis.setex(
      `game:${game.gameId}:final`,
      86400, // 24 hour TTL
      JSON.stringify(game)
    );
  } finally {
    pgClient.release();
  }
}
```

## 9. Error Handling and Recovery

### 9.1 Action Validation Errors

```typescript
enum ActionError {
  INVALID_CARD = 'INVALID_CARD',
  INSUFFICIENT_RESOURCES = 'INSUFFICIENT_RESOURCES',
  INVALID_TARGET = 'INVALID_TARGET',
  WRONG_PHASE = 'WRONG_PHASE',
  ALREADY_ACTIVATED = 'ALREADY_ACTIVATED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT'
}

function handleActionError(game: GameState, playerId: string, error: ActionError): void {
  // Log error
  logger.error(`Action error: ${error}`, { gameId: game.gameId, playerId });

  // Broadcast to player
  broadcastEvent(game, 'ACTION_INVALID', {
    player: playerId,
    error: error,
    message: getErrorMessage(error)
  });

  // Auto-pass if critical
  if (error === ActionError.TIMEOUT) {
    autoPass(game, playerId);
  }
}
```

### 9.2 Game State Recovery

```typescript
async function recoverGameState(gameId: string): Promise<GameState> {
  // Try Redis cache first
  const cached = await redis.get(`game:${gameId}`);
  if (cached) {
    return JSON.parse(cached);
  }

  // Fallback to PostgreSQL
  const result = await pool.query(
    'SELECT final_state FROM games WHERE game_id = $1 ORDER BY ended_at DESC LIMIT 1',
    [gameId]
  );

  if (result.rows.length > 0) {
    return result.rows[0].final_state;
  }

  throw new Error(`Game ${gameId} not found`);
}
```

## 10. Performance Considerations

### 10.1 Action Processing Time Targets

| Operation | Target | Max |
|-----------|--------|-----|
| Play card | <100ms | 200ms |
| Resolve ability | <150ms | 300ms |
| Combat resolution | <200ms | 400ms |
| Turn transition | <100ms | 200ms |
| Game state broadcast | <50ms | 100ms |

### 10.2 Optimization Strategies

- **Batch Updates**: Accumulate multiple state changes, then broadcast once
- **Lazy Evaluation**: Only calculate stats when needed (not every frame)
- **Database Indexing**: Index on gameId, playerId for fast recovery
- **Redis TTL**: Auto-expire inactive games after 30 minutes
- **Connection Pooling**: Maintain pool of 20-50 DB connections

## 11. Testing Requirements

### 11.1 Unit Tests for Game Logic

```python
# pytest examples
def test_play_card_insufficient_ce():
    game = create_test_game()
    player = game.players[0]
    player.current_ce = 2

    card = create_test_card(cost=5)
    result = play_card(game, player.id, card)

    assert result.success == False
    assert result.error == 'INSUFFICIENT_CE'

def test_combat_with_piercing():
    game = create_test_game()
    attacker = create_test_card(keywords=['Piercing'])
    defender = create_test_card(keywords=['Evasion'])

    resolve_combat(game, attacker, defender)

    # Piercing ignores Evasion
    assert attacker.damage_dealt > 0
```

### 11.2 Integration Tests

- Full turn processing with WebSocket updates
- Multi-phase gameplay scenarios
- Complex ability interactions
- Concurrent game simulations

### 11.3 Load Testing

- 1000 concurrent games
- 100 games simultaneously transitioning turns
- Database recovery under load

---

**Related Documents**:
- TDD 07: Card System Architecture
- TDD 03: API Specification (for WebSocket events)
- SDD 04: Comprehensive Rules

**Next Steps**:
1. Backend team implements GameEngine class
2. Database team creates game_logs tables
3. QA creates test scenarios for each game phase
4. Performance team optimizes hot paths
