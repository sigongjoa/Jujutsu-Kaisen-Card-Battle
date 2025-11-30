/**
 * Core type definitions for Jujutsu Kaisen Card Battle
 */

// ============= Card Types =============

export enum CardType {
  JUJUTSU_USER = 'JUJUTSU_USER',
  CURSED_TECHNIQUE = 'CURSED_TECHNIQUE',
  CURSED_OBJECT = 'CURSED_OBJECT',
  EVENT = 'EVENT',
  RESPONSE = 'RESPONSE'
}

export enum CardArchetype {
  OFFENSIVE = 'OFFENSIVE',
  DEFENSIVE = 'DEFENSIVE',
  CONTROL = 'CONTROL',
  COMBO = 'COMBO',
  HYBRID = 'HYBRID'
}

export enum CardRarity {
  COMMON = 'COMMON',
  UNCOMMON = 'UNCOMMON',
  RARE = 'RARE',
  LEGENDARY = 'LEGENDARY'
}

export enum CardLocation {
  HAND = 'HAND',
  FIELD = 'FIELD',
  GRAVEYARD = 'GRAVEYARD',
  BANISHED = 'BANISHED',
  DECK = 'DECK'
}

// ============= Card Abilities =============

export enum AbilityType {
  PASSIVE = 'PASSIVE',
  TRIGGERED = 'TRIGGERED',
  ACTIVATED = 'ACTIVATED'
}

export enum TriggerCondition {
  ENTER_FIELD = 'ENTER_FIELD',
  DEAL_DAMAGE = 'DEAL_DAMAGE',
  TAKE_DAMAGE = 'TAKE_DAMAGE',
  CARD_DESTROYED = 'CARD_DESTROYED',
  ON_TURN_START = 'ON_TURN_START',
  ON_TURN_END = 'ON_TURN_END',
  ON_DRAW = 'ON_DRAW',
  ON_RECHARGE = 'ON_RECHARGE',
  OPPONENT_PLAYS_CARD = 'OPPONENT_PLAYS_CARD'
}

export enum EffectType {
  DAMAGE = 'DAMAGE',
  HEAL = 'HEAL',
  DRAW = 'DRAW',
  DESTROY = 'DESTROY',
  MODIFY_STAT = 'MODIFY_STAT',
  STATUS_EFFECT = 'STATUS_EFFECT',
  COST_REDUCTION = 'COST_REDUCTION',
  GAIN_KEYWORD = 'GAIN_KEYWORD',
  BOUNCE = 'BOUNCE',
  DISCARD = 'DISCARD'
}

export interface CardAbility {
  abilityId: string;
  name: string;
  type: AbilityType;
  triggerCondition?: TriggerCondition;
  cost?: number;
  effect: EffectPayload;
  timing: 'IMMEDIATE' | 'STACK' | 'RESPONSE';
  priority: number;
  repeatable: boolean;
  maxRepeatPerTurn?: number;
}

export interface EffectPayload {
  type: EffectType;
  target: 'SELF' | 'ALLY' | 'ENEMY' | 'PLAYER' | 'ALL';
  value?: number;
  duration?: 'PERMANENT' | 'UNTIL_END_OF_TURN' | 'UNTIL_EOL';
  stat?: 'ATK' | 'DEF';
  condition?: string;
}

// ============= Card Data =============

export interface CardData {
  cardId: string;
  name: string;
  type: CardType;
  archetype: CardArchetype;
  cost: number;
  rarity: CardRarity;
  stats?: {
    atk: number;
    def: number;
    maxHp?: number;
  };
  abilities: CardAbility[];
  keywords: string[];
  powerScore: number;
  metaTier: 'S+' | 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  description: string;
  flavorText?: string;
}

export interface CardInstance {
  cardInstanceId: string;
  cardId: string;
  ownerId: string;
  location: CardLocation;
  position: 'FACE_UP' | 'FACE_DOWN';
  tappedStatus?: boolean;
  currentHp?: number;
  modifiers: CardModifier[];
  statusEffects: StatusEffect[];
  counters: Record<string, number>;
}

export interface CardModifier {
  modifierId: string;
  source: string;
  type: 'STAT_BOOST' | 'STAT_REDUCTION' | 'KEYWORD_GRANT' | 'ABILITY_GRANT';
  stat?: 'ATK' | 'DEF';
  value?: number;
  duration: 'PERMANENT' | 'UNTIL_END_OF_TURN' | 'UNTIL_EOL';
  isActive: boolean;
}

export interface StatusEffect {
  effectId: string;
  type: 'STUN' | 'POISON' | 'CURSED_SEAL' | 'WEAKNESS' | 'EVASION_USED' | 'CUSTOM';
  value?: number;
  duration: number;
  source: string;
}

// ============= Game State =============

export enum GamePhaseType {
  RECHARGE = 'RECHARGE',
  DRAW = 'DRAW',
  MAIN_A = 'MAIN_A',
  BATTLE = 'BATTLE',
  MAIN_B = 'MAIN_B',
  END = 'END'
}

export interface GamePhase {
  type: GamePhaseType;
  step: number;
  priority: 'ACTIVE' | 'INACTIVE' | 'RESPONSE';
  timeRemaining?: number;
}

export interface PlayerGameState {
  playerId: string;
  username: string;
  currentHp: number;
  maxHp: number;
  currentCursedEnergy: number;
  maxCursedEnergy: number;

  deck: CardInstance[];
  hand: CardInstance[];
  field: CardInstance[];
  graveyard: CardInstance[];
  banished: CardInstance[];

  isPriority: boolean;
  hasResponded: boolean;
  passCount: number;
  statusEffects: StatusEffect[];
  damageReduction: number;
  evasionUsed: boolean;
}

export interface GameState {
  gameId: string;
  matchId: string;
  status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED';
  createdAt: Date;
  startedAt?: Date;
  endedAt?: Date;

  players: Record<string, PlayerGameState>;
  currentTurn: number;
  currentPhase: GamePhase;
  currentPlayerIndex: number;

  stack: StackEntry[];
  history: GameAction[];
  winner?: string;
  winCondition?: string;
}

export interface StackEntry {
  entryId: string;
  source: CardInstance;
  ability: CardAbility;
  targets: CardInstance[];
  priority: number;
  resolveAt: number;
  controller: string;
}

// ============= Game Actions =============

export type GameActionType =
  | 'PLAY_CARD'
  | 'ATTACK'
  | 'BLOCK'
  | 'ACTIVATE_ABILITY'
  | 'PASS'
  | 'SURRENDER'
  | 'PLAY_RESPONSE'
  | 'DECLARE_ATTACKS'
  | 'DECLARE_BLOCKS';

export interface GameAction {
  actionId: string;
  type: GameActionType;
  playerId: string;
  timestamp: number;
  cardInstanceId?: string;
  targetIds?: string[];
  x?: number;
}

// ============= User Types =============

export interface User {
  userId: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  userId: string;
  username: string;
  displayName: string;
  bio?: string;
  avatar?: string;
  totalGames: number;
  totalWins: number;
  eloRating: number;
  joinedAt: Date;
}

// ============= Deck Types =============

export interface DeckListItem {
  cardId: string;
  quantity: number;
}

export interface Deck {
  deckId: string;
  ownerId: string;
  name: string;
  description: string;
  cards: DeckListItem[];
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
}

// ============= API Request/Response Types =============

export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export interface CreateDeckRequest {
  name: string;
  description: string;
  cards: DeckListItem[];
}

export interface PlayCardRequest {
  cardInstanceId: string;
  targetIds?: string[];
  x?: number;
}

export interface DeclareAttacksRequest {
  attacks: Array<{
    attackerId: string;
    targetType: 'PLAYER' | 'CARD';
    targetCardId?: string;
  }>;
}

// ============= WebSocket Message Types =============

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

export interface GameStateUpdateMessage extends WebSocketMessage {
  type: 'GAME_STATE_UPDATE';
  data: GameState;
}

export interface PhaseChangeMessage extends WebSocketMessage {
  type: 'PHASE_CHANGE';
  data: GamePhase;
}

export interface ActionResultMessage extends WebSocketMessage {
  type: 'ACTION_RESULT';
  data: {
    actionId: string;
    success: boolean;
    error?: string;
  };
}
