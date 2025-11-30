/**
 * Frontend type definitions (mirrors backend types where needed)
 */

// ============= Game Types =============

export enum CardType {
  JUJUTSU_USER = 'JUJUTSU_USER',
  CURSED_TECHNIQUE = 'CURSED_TECHNIQUE',
  CURSED_OBJECT = 'CURSED_OBJECT',
  EVENT = 'EVENT',
  RESPONSE = 'RESPONSE'
}

export enum CardLocation {
  HAND = 'HAND',
  FIELD = 'FIELD',
  GRAVEYARD = 'GRAVEYARD',
  BANISHED = 'BANISHED',
  DECK = 'DECK'
}

export enum GamePhaseType {
  RECHARGE = 'RECHARGE',
  DRAW = 'DRAW',
  MAIN_A = 'MAIN_A',
  BATTLE = 'BATTLE',
  MAIN_B = 'MAIN_B',
  END = 'END'
}

export interface CardData {
  cardId: string;
  name: string;
  type: CardType;
  cost: number;
  stats?: {
    atk: number;
    def: number;
    maxHp?: number;
  };
  keywords: string[];
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
  deck: { count: number };
  hand: CardInstance[];
  field: CardInstance[];
  graveyard: CardInstance[];
  statusEffects: any[];
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
  stack: any[];
  history: any[];
  winner?: string;
  winCondition?: string;
}

// ============= API Types =============

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

// ============= WebSocket Types =============

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}
