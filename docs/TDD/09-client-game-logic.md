# TDD 09: Client Game Logic (클라이언트 게임 로직)

**Document Type**: Technical Design Document
**Status**: Active
**Last Updated**: 2025-11-30
**Target Audience**: Frontend Developers, UI/UX Engineers, QA Engineers

---

## 1. Overview

This document specifies the client-side game logic for Jujutsu Kaisen Card Battle. The client is **stateless** and receives authoritative game state from the server via WebSocket. The client's responsibility is:

1. **Input Handling**: Capture and validate user actions
2. **UI State Management**: Track UI state separate from game state
3. **Visual Feedback**: Render game state with animations
4. **Prediction**: Optional client-side prediction for responsiveness
5. **Communication**: Send actions to server and receive state updates

### 1.1 Client-Server Architecture

```
┌─────────────────┐                      ┌─────────────────┐
│                 │                      │                 │
│   Browser/     │───REST API───────────│   Backend API   │
│   Client        │  (Auth, Deck)        │   Service       │
│                 │                      │                 │
│   Redux Store  │                      │   Database      │
│   UI Components │                      │   Game Engine   │
│   WebSocket     │──WebSocket Events──→│   (Authority)   │
│   Manager       │←─Game State Updates──│                 │
│                 │                      │                 │
└─────────────────┘                      └─────────────────┘

Client never modifies game state directly.
All game logic runs on server.
Client receives authoritative updates.
```

## 2. Client-Side State Architecture

### 2.1 Redux Store Structure

```typescript
interface RootState {
  auth: AuthState;
  deck: DeckState;
  game: GameState;
  ui: UIState;
}

// === AUTH STATE ===
interface AuthState {
  isAuthenticated: boolean;
  userId: string;
  username: string;
  token: string;
  user: User;
}

// === DECK STATE ===
interface DeckState {
  decks: Deck[];
  currentDeckId: string;
  loading: boolean;
  error: string;
}

// === GAME STATE (Received from server) ===
interface GameState {
  gameId: string;
  status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED';
  players: {
    [playerId: string]: PlayerGameState;
  };
  currentTurn: number;
  currentPhase: GamePhase;
  currentPlayerIndex: number;
  stack: Effect[];
  history: GameAction[];
}

interface PlayerGameState {
  playerId: string;
  username: string;
  currentHp: number;
  maxHp: number;
  currentCE: number;
  maxCE: number;
  deck: { count: number }; // Don't reveal entire deck
  hand: CardInHand[]; // Own hand visible, opponent hand hidden
  field: CardInPlay[];
  graveyard: CardInGraveyard[];
  statusEffects: StatusEffect[];
}

interface CardInHand {
  cardInstanceId: string;
  cardId: string;
  position: number; // Position in hand (0-9)
  isFaceUp: boolean;
}

interface CardInPlay {
  cardInstanceId: string;
  cardId: string;
  cardName: string;
  atk: number;
  def: number;
  hp: number;
  isTapped: boolean;
  isReversed: boolean;
  keywords: string[];
  statusEffects: StatusEffect[];
  owner: 'SELF' | 'OPPONENT';
}

// === UI STATE (Client-side only) ===
interface UIState {
  selectedCard: string | null;
  selectedTargets: string[];
  hoveredCard: string | null;
  hoveredZone: ZoneType | null;
  animatingCards: string[];
  showHand: boolean;
  showLog: boolean;
  showStats: boolean;
  phase: GamePhase;
  canPlayCards: boolean;
  canAttack: boolean;
  waitingForOpponent: boolean;
  notification: Notification | null;
  tooltipCard: Card | null;
}

interface Notification {
  id: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  duration: number;
}

interface GamePhase {
  type: 'RECHARGE' | 'DRAW' | 'MAIN_A' | 'BATTLE' | 'MAIN_B' | 'END';
  priority: 'ACTIVE' | 'INACTIVE' | 'RESPONSE';
  timeRemaining: number;
}
```

### 2.2 Redux Actions

```typescript
// Auth actions
const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {
    loginSuccess: (state, action) => { state = action.payload; },
    logout: (state) => { state = initialAuthState; }
  }
});

// Deck actions
const deckSlice = createSlice({
  name: 'deck',
  initialState: initialDeckState,
  reducers: {
    setDecks: (state, action) => { state.decks = action.payload; },
    selectDeck: (state, action) => { state.currentDeckId = action.payload; }
  }
});

// Game actions (reduced - most state comes from server)
const gameSlice = createSlice({
  name: 'game',
  initialState: initialGameState,
  reducers: {
    startGame: (state, action) => { state = action.payload; },
    updateGameState: (state, action) => {
      // Merge server state with local state
      return { ...state, ...action.payload };
    },
    endGame: (state, action) => { state.status = 'COMPLETED'; }
  }
});

// UI actions (client-side only)
const uiSlice = createSlice({
  name: 'ui',
  initialState: initialUIState,
  reducers: {
    selectCard: (state, action) => { state.selectedCard = action.payload; },
    addTarget: (state, action) => {
      if (!state.selectedTargets.includes(action.payload)) {
        state.selectedTargets.push(action.payload);
      }
    },
    removeTarget: (state, action) => {
      state.selectedTargets = state.selectedTargets.filter(
        t => t !== action.payload
      );
    },
    clearSelection: (state) => {
      state.selectedCard = null;
      state.selectedTargets = [];
    },
    setPhase: (state, action) => { state.phase = action.payload; },
    setCanPlayCards: (state, action) => { state.canPlayCards = action.payload; },
    setWaitingForOpponent: (state, action) => {
      state.waitingForOpponent = action.payload;
    }
  }
});
```

## 3. User Input Handling

### 3.1 Card Play Flow

```typescript
// User clicks on card in hand
function handleCardSelection(cardInstanceId: string): void {
  const card = getCardFromHand(cardInstanceId);

  if (!card) return;

  dispatch(uiSlice.actions.selectCard(cardInstanceId));

  // Check if card requires targets
  const metadata = getCardMetadata(card);
  if (metadata.requiresTarget) {
    showTargetSelection(card);
  } else {
    // Show preview of what will happen
    showCardPreview(card);
  }
}

// User clicks target
function handleTargetSelection(targetId: string): void {
  const selectedCard = getState().ui.selectedCard;

  if (!selectedCard) return;

  // Validate target
  const isValidTarget = validateTarget(selectedCard, targetId);

  if (!isValidTarget) {
    showNotification('Invalid target', 'WARNING');
    return;
  }

  dispatch(uiSlice.actions.addTarget(targetId));

  // Check if all targets selected
  const card = getCardFromState(selectedCard);
  const metadata = getCardMetadata(card);
  if (getState().ui.selectedTargets.length >= metadata.maxTargets) {
    confirmAndPlayCard();
  }
}

// User confirms play
function handlePlayCard(): void {
  const state = getState();
  const cardInstanceId = state.ui.selectedCard;
  const targets = state.ui.selectedTargets;

  const card = getCardFromHand(cardInstanceId);
  if (!card) {
    showNotification('Card not found', 'ERROR');
    return;
  }

  // Send to server
  sendAction({
    type: 'PLAY_CARD',
    cardInstanceId: cardInstanceId,
    targetIds: targets
  });

  // Clear selection immediately (feedback)
  dispatch(uiSlice.actions.clearSelection());

  // Server will respond with game state update
}

// User wants to cancel
function handleCancelAction(): void {
  dispatch(uiSlice.actions.clearSelection());
}
```

### 3.2 Attack Declaration Flow

```typescript
interface AttackAction {
  attackerId: string;
  targetType: 'PLAYER' | 'CARD';
  targetCardId?: string;
}

let pendingAttacks: AttackAction[] = [];

function handleDeclareAttack(cardInstanceId: string): void {
  const card = getCardFromField(cardInstanceId);

  if (!card) return;

  // Validate can attack
  const canAttack = validateCanAttack(card);
  if (!canAttack) {
    showNotification('Card cannot attack', 'WARNING');
    return;
  }

  // If targeting card, wait for target selection
  const validTargets = getValidTargets(card);
  if (validTargets.length > 0) {
    showTargetSelection(card);
  } else {
    // Target player directly
    addAttack(cardInstanceId, 'PLAYER');
  }
}

function handleSelectAttackTarget(targetCardId: string): void {
  const card = getState().ui.selectedCard;
  addAttack(card, 'CARD', targetCardId);
}

function addAttack(attackerId: string, targetType: 'PLAYER' | 'CARD', targetCardId?: string): void {
  pendingAttacks.push({
    attackerId,
    targetType,
    targetCardId
  });

  dispatch(uiSlice.actions.clearSelection());
  updateAttackPreview();
}

function handleConfirmAttacks(): void {
  sendAction({
    type: 'DECLARE_ATTACKS',
    attacks: pendingAttacks
  });

  pendingAttacks = [];
  dispatch(uiSlice.actions.setPhase({ ...getState().ui.phase, canAttack: false }));
}

function handleCancelAttacks(): void {
  pendingAttacks = [];
  updateAttackPreview();
}
```

### 3.3 Response Action Flow

```typescript
let responseWindowActive = false;

function handleResponseWindowOpen(timeout: number = 3000): void {
  responseWindowActive = true;
  dispatch(uiSlice.actions.setPhase({
    type: 'RESPONSE_WINDOW',
    priority: 'INACTIVE',
    timeRemaining: timeout
  }));

  // Countdown timer
  startResponseTimer(timeout);
}

function handlePlayResponse(cardInstanceId: string): void {
  const card = getCardFromHand(cardInstanceId);

  if (!card || !isResponseCard(card)) {
    showNotification('Cannot play that card as response', 'WARNING');
    return;
  }

  sendAction({
    type: 'PLAY_RESPONSE',
    cardInstanceId: cardInstanceId,
    targetIds: getState().ui.selectedTargets
  });

  dispatch(uiSlice.actions.clearSelection());
}

function handlePassResponse(): void {
  if (!responseWindowActive) return;

  sendAction({ type: 'PASS_RESPONSE' });

  responseWindowActive = false;
  dispatch(uiSlice.actions.setWaitingForOpponent(true));
}
```

## 4. WebSocket Event Handling

### 4.1 WebSocket Middleware

```typescript
// Redux middleware for WebSocket management
function webSocketMiddleware(store: Store): MiddlewareAPI {
  let ws: WebSocket;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;

  return (next: Dispatch) => (action: AnyAction) => {
    switch (action.type) {
      case 'GAME_START':
        connectWebSocket(store, action.payload.gameId);
        break;

      case 'GAME_END':
        disconnectWebSocket();
        break;

      default:
        return next(action);
    }
  };

  function connectWebSocket(store: Store, gameId: string): void {
    const gameServer = process.env.REACT_APP_GAME_SERVER || 'ws://localhost:8000';
    const token = store.getState().auth.token;

    ws = new WebSocket(`${gameServer}/game/${gameId}?token=${token}`);

    ws.onopen = () => {
      console.log('WebSocket connected');
      reconnectAttempts = 0;
      store.dispatch(uiSlice.actions.setWaitingForOpponent(false));
    };

    ws.onmessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);
      handleGameMessage(store, message);
    };

    ws.onerror = (event: Event) => {
      console.error('WebSocket error:', event);
      store.dispatch(uiSlice.actions.setWaitingForOpponent(true));
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      attemptReconnect(store, gameId);
    };
  }

  function handleGameMessage(store: Store, message: GameMessage): void {
    switch (message.type) {
      case 'GAME_STATE_UPDATE':
        store.dispatch(gameSlice.actions.updateGameState(message.data));
        break;

      case 'PHASE_CHANGE':
        store.dispatch(uiSlice.actions.setPhase(message.data));
        break;

      case 'RESPONSE_WINDOW':
        store.dispatch(uiSlice.actions.setWaitingForOpponent(false));
        handleResponseWindowOpen(message.data.timeout);
        break;

      case 'ACTION_INVALID':
        showNotification(message.data.message, 'ERROR');
        break;

      case 'GAME_END':
        store.dispatch(gameSlice.actions.endGame(message.data));
        break;

      case 'CHAT_MESSAGE':
        addChatMessage(message.data);
        break;

      default:
        console.warn('Unknown message type:', message.type);
    }
  }

  function attemptReconnect(store: Store, gameId: string): void {
    if (reconnectAttempts < maxReconnectAttempts) {
      reconnectAttempts++;
      const backoff = Math.pow(2, reconnectAttempts) * 1000; // Exponential backoff

      setTimeout(() => {
        console.log(`Reconnecting... (attempt ${reconnectAttempts})`);
        connectWebSocket(store, gameId);
      }, backoff);
    } else {
      showNotification('Connection lost. Game will end.', 'ERROR');
      store.dispatch(gameSlice.actions.endGame({
        winner: 'OPPONENT',
        reason: 'CONNECTION_LOST'
      }));
    }
  }

  function disconnectWebSocket(): void {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
  }
}
```

### 4.2 Sending Actions to Server

```typescript
function sendAction(action: GameAction): void {
  const state = getState();

  if (!state.game.gameId) {
    showNotification('Game not found', 'ERROR');
    return;
  }

  const ws = getWebSocket(); // From middleware

  if (!ws || ws.readyState !== WebSocket.OPEN) {
    showNotification('Connection lost', 'ERROR');
    return;
  }

  const message = {
    type: 'GAME_ACTION',
    action: action,
    playerId: state.auth.userId,
    timestamp: Date.now()
  };

  ws.send(JSON.stringify(message));

  // Optimistically update UI (will be corrected by server)
  optimisticallyUpdateUI(action);
}

function optimisticallyUpdateUI(action: GameAction): void {
  switch (action.type) {
    case 'PLAY_CARD':
      // Remove from hand immediately
      const cardIndex = getState().game.players[getState().auth.userId].hand
        .findIndex(c => c.cardInstanceId === action.cardInstanceId);
      if (cardIndex >= 0) {
        // Update would happen here, but wait for server confirmation
      }
      break;

    case 'PASS':
      dispatch(uiSlice.actions.setWaitingForOpponent(true));
      break;
  }
}
```

## 5. Game Board Rendering

### 5.1 Component Architecture

```
GameBoard (Main Container)
├── PlayerInfo
│   ├── HealthBar (Self)
│   ├── HealthBar (Opponent)
│   ├── CECounter (Self)
│   └── CECounter (Opponent)
├── OpponentField
│   ├── OpponentCards (Read-only)
│   ├── OpponentGraveyard
│   └── OpponentDeck
├── CenterArea
│   ├── Stack (Active effects)
│   ├── PhaseIndicator
│   └── TurnTimer
├── SelfField
│   ├── CardRow (Draggable)
│   ├── GraveyardRow
│   └── DeckCounter
├── Hand
│   ├── HandCard (Selectable, Draggable)
│   ├── HandCard
│   └── HandCard
└── Sidebar
    ├── GameLog
    ├── CardStats
    └── Options
```

### 5.2 Card Component

```typescript
interface CardProps {
  card: Card;
  location: 'HAND' | 'FIELD' | 'GRAVEYARD';
  isSelected: boolean;
  isValidTarget: boolean;
  onSelect: (cardId: string) => void;
  onDragStart: (event: DragEvent) => void;
  onDragEnd: (event: DragEvent) => void;
  scale?: number;
}

const CardView: React.FC<CardProps> = ({
  card,
  location,
  isSelected,
  isValidTarget,
  onSelect,
  onDragStart,
  onDragEnd,
  scale = 1
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleMouseEnter = () => {
    setShowTooltip(true);
    dispatch(uiSlice.actions.hoverCard(card.cardId));
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <div
      className={`card ${isSelected ? 'selected' : ''} ${isValidTarget ? 'valid-target' : ''}`}
      onClick={() => onSelect(card.cardInstanceId)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      draggable={location === 'HAND'}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      style={{ transform: `scale(${scale})` }}
    >
      {/* Card face */}
      <div className="card-face">
        <img src={card.imageUrl} alt={card.name} className="card-image" />
        <div className="card-name">{card.name}</div>
        <div className="card-cost">{card.cost}</div>

        {location === 'FIELD' && (
          <div className="card-stats">
            <span className="atk">{card.stats.atk}</span>
            <span className="def">{card.stats.def}</span>
          </div>
        )}

        {card.keywords.map(keyword => (
          <div key={keyword} className="keyword-badge">{keyword}</div>
        ))}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <CardTooltip card={card} />
      )}

      {/* Status effects */}
      {card.statusEffects.map(effect => (
        <div key={effect.id} className="status-effect">
          {effect.icon}
        </div>
      ))}

      {/* Tapped indicator */}
      {location === 'FIELD' && card.isTapped && (
        <div className="tapped-indicator" />
      )}
    </div>
  );
};

export default CardView;
```

### 5.3 Hand Rendering

```typescript
const Hand: React.FC = () => {
  const hand = useSelector(state =>
    state.game.players[state.auth.userId].hand
  );
  const selectedCard = useSelector(state => state.ui.selectedCard);
  const validTargets = useSelector(state => state.ui.validTargets);

  const handleCardSelect = (cardId: string) => {
    dispatch(selectCard(cardId));
  };

  return (
    <div className="hand">
      <div className="hand-cards">
        {hand.map((card, index) => (
          <CardView
            key={card.cardInstanceId}
            card={card}
            location="HAND"
            isSelected={selectedCard === card.cardInstanceId}
            isValidTarget={validTargets.includes(card.cardInstanceId)}
            onSelect={handleCardSelect}
            onDragStart={(e) => startDrag(e, card.cardInstanceId)}
            onDragEnd={(e) => endDrag(e)}
            scale={1 + (index - hand.length / 2) * 0.1} // Fan effect
          />
        ))}
      </div>
      <div className="hand-info">
        {hand.length} / 10 cards
      </div>
    </div>
  );
};
```

## 6. Game Phase Management

### 6.1 Phase State Updates

```typescript
function handlePhaseChange(newPhase: GamePhase): void {
  dispatch(uiSlice.actions.setPhase(newPhase));

  switch (newPhase.type) {
    case 'RECHARGE':
      dispatch(uiSlice.actions.setCanPlayCards(false));
      dispatch(uiSlice.actions.setCanAttack(false));
      break;

    case 'DRAW':
      dispatch(uiSlice.actions.setCanPlayCards(false));
      dispatch(uiSlice.actions.setCanAttack(false));
      break;

    case 'MAIN_A':
      if (newPhase.priority === 'ACTIVE') {
        dispatch(uiSlice.actions.setCanPlayCards(true));
        dispatch(uiSlice.actions.setCanAttack(false));
        dispatch(uiSlice.actions.setWaitingForOpponent(false));
      } else {
        dispatch(uiSlice.actions.setWaitingForOpponent(true));
      }
      break;

    case 'BATTLE':
      if (newPhase.priority === 'ACTIVE') {
        dispatch(uiSlice.actions.setCanPlayCards(false));
        dispatch(uiSlice.actions.setCanAttack(true));
        dispatch(uiSlice.actions.setWaitingForOpponent(false));
      } else {
        dispatch(uiSlice.actions.setWaitingForOpponent(true));
      }
      break;

    case 'MAIN_B':
      if (newPhase.priority === 'ACTIVE') {
        dispatch(uiSlice.actions.setCanPlayCards(true));
        dispatch(uiSlice.actions.setCanAttack(false));
      }
      break;

    case 'END':
      dispatch(uiSlice.actions.setCanPlayCards(false));
      dispatch(uiSlice.actions.setCanAttack(false));
      break;
  }
}
```

### 6.2 Action Button States

```typescript
interface ActionButtonsProps {
  canPlayCards: boolean;
  canAttack: boolean;
  canRespond: boolean;
  selectedCard: string | null;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  canPlayCards,
  canAttack,
  canRespond,
  selectedCard
}) => {
  const handlePlayCard = () => {
    if (!selectedCard) {
      showNotification('Select a card first', 'WARNING');
      return;
    }
    sendAction({
      type: 'PLAY_CARD',
      cardInstanceId: selectedCard,
      targetIds: getState().ui.selectedTargets
    });
  };

  const handleConfirmAttacks = () => {
    sendAction({
      type: 'DECLARE_ATTACKS',
      attacks: pendingAttacks
    });
  };

  const handlePass = () => {
    sendAction({ type: 'PASS' });
  };

  return (
    <div className="action-buttons">
      <button
        className="btn-play"
        disabled={!canPlayCards || !selectedCard}
        onClick={handlePlayCard}
      >
        Play Card
      </button>

      <button
        className="btn-attack"
        disabled={!canAttack}
        onClick={handleConfirmAttacks}
      >
        Confirm Attacks
      </button>

      <button
        className="btn-respond"
        disabled={!canRespond}
        onClick={() => handlePlayResponse(selectedCard)}
      >
        Play Response
      </button>

      <button
        className="btn-pass"
        onClick={handlePass}
      >
        Pass
      </button>

      <button
        className="btn-surrender"
        onClick={() => sendAction({ type: 'SURRENDER' })}
      >
        Surrender
      </button>
    </div>
  );
};
```

## 7. Animations and Visual Feedback

### 7.1 Card Animation Sequences

```typescript
interface AnimationSequence {
  name: string;
  duration: number;
  keyframes: Keyframe[];
}

const animations = {
  cardPlay: {
    name: 'card-play',
    duration: 600,
    keyframes: [
      { transform: 'scale(1)', opacity: 1, offset: 0 },
      { transform: 'scale(1.1)', opacity: 0.8, offset: 0.5 },
      { transform: 'scale(0.9)', opacity: 1, offset: 1 }
    ]
  },
  cardDraw: {
    name: 'card-draw',
    duration: 400,
    keyframes: [
      { transform: 'translateY(200px)', opacity: 0, offset: 0 },
      { transform: 'translateY(0)', opacity: 1, offset: 1 }
    ]
  },
  damageHit: {
    name: 'damage-hit',
    duration: 300,
    keyframes: [
      { transform: 'shake(0deg)', offset: 0 },
      { transform: 'shake(5deg)', offset: 0.25 },
      { transform: 'shake(-5deg)', offset: 0.5 },
      { transform: 'shake(0deg)', offset: 1 }
    ]
  },
  heal: {
    name: 'heal',
    duration: 500,
    keyframes: [
      { color: '#00FF00', offset: 0 },
      { color: '#FFFFFF', offset: 1 }
    ]
  }
};

function playAnimation(element: HTMLElement, animation: AnimationSequence): Promise<void> {
  return new Promise((resolve) => {
    const anim = element.animate(animation.keyframes, {
      duration: animation.duration,
      easing: 'ease-out'
    });

    anim.onfinish = () => resolve();
  });
}
```

### 7.2 Damage Number Popups

```typescript
interface DamagePopupProps {
  amount: number;
  x: number;
  y: number;
  type: 'DAMAGE' | 'HEAL';
}

const DamagePopup: React.FC<DamagePopupProps> = ({ amount, x, y, type }) => {
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => setOpacity(0), 1500);
    return () => clearTimeout(timer);
  }, []);

  const color = type === 'DAMAGE' ? '#FF0000' : '#00FF00';

  return (
    <div
      className="damage-popup"
      style={{
        left: x,
        top: y,
        opacity: opacity,
        color: color,
        transform: 'translateY(-60px)',
        transition: 'all 1.5s ease-out'
      }}
    >
      {type === 'DAMAGE' ? '-' : '+'}{amount}
    </div>
  );
};
```

## 8. Prediction and Optimistic Updates

### 8.1 Client-Side Prediction

```typescript
function predictPlayCard(
  card: Card,
  targets: string[],
  gameState: GameState
): PredictedState {
  // Clone current state
  const predicted = JSON.parse(JSON.stringify(gameState));

  // Remove card from hand
  const player = predicted.players[card.ownerId];
  player.hand = player.hand.filter(c => c.cardInstanceId !== card.cardInstanceId);

  // Add card to field
  predicted.field.push({
    ...card,
    location: 'FIELD'
  });

  // Reduce CE
  player.currentCursedEnergy = Math.max(0, player.currentCursedEnergy - card.cost);

  return predicted;
}

// Use for immediate UI feedback
function optimisticallyPlayCard(card: Card): void {
  const currentState = getState().game;
  const predicted = predictPlayCard(card, [], currentState);

  // Show predicted state while waiting for server
  showPredictedState(predicted);

  // Actually send action
  sendAction({
    type: 'PLAY_CARD',
    cardInstanceId: card.cardInstanceId,
    targetIds: []
  });

  // Server will send authoritative state update
}
```

## 9. Error Handling and Recovery

### 9.1 Connection Loss Recovery

```typescript
function handleConnectionLoss(): void {
  showNotification('Connection lost. Attempting to reconnect...', 'WARNING');

  const reconnectInterval = setInterval(() => {
    if (isWebSocketConnected()) {
      clearInterval(reconnectInterval);
      showNotification('Reconnected!', 'SUCCESS');

      // Request full state resync
      sendAction({
        type: 'SYNC_STATE'
      });
    }
  }, 2000);

  // Timeout after 30 seconds
  setTimeout(() => {
    if (!isWebSocketConnected()) {
      clearInterval(reconnectInterval);
      showNotification('Connection lost permanently. Game will end.', 'ERROR');
      dispatch(gameSlice.actions.endGame({
        winner: 'OPPONENT',
        reason: 'CONNECTION_LOST'
      }));
    }
  }, 30000);
}
```

### 9.2 Invalid Action Handling

```typescript
function handleActionInvalid(error: ActionError): void {
  switch (error.type) {
    case 'INSUFFICIENT_CE':
      showNotification('Not enough Cursed Energy to play this card', 'ERROR');
      break;

    case 'INVALID_TARGET':
      showNotification('Cannot target this card', 'ERROR');
      break;

    case 'WRONG_PHASE':
      showNotification('Cannot play this card in this phase', 'ERROR');
      break;

    case 'ALREADY_ACTIVATED':
      showNotification('This ability has already been used this turn', 'ERROR');
      break;

    default:
      showNotification('Invalid action', 'ERROR');
  }

  // Clear selection for retry
  dispatch(uiSlice.actions.clearSelection());
}
```

## 10. Performance Optimization

### 10.1 React Optimization

```typescript
// Memoized components to prevent unnecessary re-renders
const CardView = React.memo((props: CardProps) => {
  // ... component code
}, (prevProps, nextProps) => {
  // Custom comparison
  return (
    prevProps.card.cardId === nextProps.card.cardId &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.location === nextProps.location
  );
});

// Use selectors to extract only needed state
const selectMyHand = (state: RootState) =>
  state.game.players[state.auth.userId].hand;

const Hand: React.FC = () => {
  const hand = useSelector(selectMyHand);
  // Only re-renders when hand changes
};
```

### 10.2 Animation Performance

```typescript
// Use CSS animations instead of JS when possible
const cardPlayCSS = `
  @keyframes card-play {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.1); opacity: 0.8; }
    100% { transform: scale(0.9); opacity: 1; }
  }

  .card.playing {
    animation: card-play 0.6s ease-out;
  }
`;

// Request animation frame for smooth updates
function updateGameDisplay(): void {
  requestAnimationFrame(() => {
    // Update UI here
  });
}
```

## 11. Testing Requirements

### 11.1 Component Tests (Jest + React Testing Library)

```typescript
describe('Hand Component', () => {
  it('should render cards from state', () => {
    const hand = [
      { cardInstanceId: '1', cardId: 'JK-001', name: 'Card 1' },
      { cardInstanceId: '2', cardId: 'JK-002', name: 'Card 2' }
    ];

    render(
      <Provider store={mockStore({ game: { players: { ['user-1']: { hand } } } })}>
        <Hand />
      </Provider>
    );

    expect(screen.getByText('Card 1')).toBeInTheDocument();
    expect(screen.getByText('Card 2')).toBeInTheDocument();
  });

  it('should highlight selected card', () => {
    // ... test code
  });
});
```

### 11.2 Integration Tests (Cypress)

```typescript
describe('Game Flow', () => {
  it('should play card and update game state', () => {
    cy.visit('/game/test-game-id');

    // Wait for connection
    cy.get('.game-board').should('be.visible');

    // Select and play card
    cy.get('[data-testid="hand-card-0"]').click();
    cy.get('[data-testid="btn-play"]').click();

    // Verify action sent
    cy.get('@wsMessage').should((messages) => {
      expect(messages[messages.length - 1]).toEqual(
        expect.objectContaining({
          type: 'GAME_ACTION',
          action: { type: 'PLAY_CARD' }
        })
      );
    });

    // Wait for server response
    cy.get('[data-testid="field-card"]').should('have.length', 1);
  });
});
```

---

**Related Documents**:
- TDD 08: Server Game Logic
- TDD 06: Frontend Architecture
- TDD 03: API Specification

**Next Steps**:
1. Frontend team implements Redux store structure
2. Design team creates UI mockups
3. Frontend team builds React components
4. QA creates E2E test scenarios
5. Performance team profiles animations
