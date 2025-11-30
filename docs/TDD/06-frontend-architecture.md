# TDD 06: Frontend Architecture & Component Design

**문서 분류**: TDD (Technical Design Document)
**작성자**: Frontend Engineering Team
**최종 업데이트**: 2025-11-30
**상태**: Production Ready

---

## 1. 프론트엔드 기술 스택

### 1.1 핵심 라이브러리

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.x",
    "redux": "^4.x",
    "react-redux": "^8.x",
    "@reduxjs/toolkit": "^1.x",
    "socket.io-client": "^4.x",
    "axios": "^1.x",
    "classnames": "^2.x",
    "zustand": "^4.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "vite": "^4.x",
    "tailwindcss": "^3.x",
    "jest": "^29.x",
    "@testing-library/react": "^14.x",
    "cypress": "^13.x"
  }
}
```

### 1.2 프로젝트 구조

```
src/
├── assets/
│   ├── images/
│   ├── icons/
│   └── styles/
│
├── components/                    # 재사용 가능한 컴포넌트
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── MainLayout.tsx
│   └── game/
│       ├── GameBoard.tsx
│       ├── Hand.tsx
│       ├── Battlefield.tsx
│       └── GameStatus.tsx
│
├── pages/                         # 페이지 컴포넌트
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   ├── DeckBuilderPage.tsx
│   ├── GamePage.tsx
│   └── LobbyPage.tsx
│
├── store/                         # Redux store
│   ├── slices/
│   │   ├── authSlice.ts
│   │   ├── gameSlice.ts
│   │   ├── cardSlice.ts
│   │   └── deckSlice.ts
│   ├── middleware/
│   │   ├── gameMiddleware.ts
│   │   └── wsMiddleware.ts
│   └── index.ts
│
├── hooks/                         # Custom hooks
│   ├── useGame.ts
│   ├── useWebSocket.ts
│   ├── useCards.ts
│   └── useAuth.ts
│
├── services/                      # API 서비스
│   ├── api.ts
│   ├── authService.ts
│   ├── gameService.ts
│   ├── cardService.ts
│   └── wsService.ts
│
├── utils/
│   ├── validators.ts
│   ├── formatters.ts
│   ├── constants.ts
│   └── helpers.ts
│
├── types/                         # TypeScript 타입 정의
│   ├── card.ts
│   ├── game.ts
│   ├── user.ts
│   └── api.ts
│
├── styles/                        # 전역 스타일
│   ├── tailwind.css
│   ├── variables.css
│   └── animations.css
│
├── App.tsx
├── index.tsx
└── main.tsx
```

---

## 2. 주요 컴포넌트 아키텍처

### 2.1 페이지 계층 구조

```
App
├── HomePage
├── LoginPage
├── RegisterPage
├── DeckBuilderPage
│   ├── DeckEditor
│   │   ├── CardSearch
│   │   ├── CardSelector
│   │   └── DeckStats
│   └── ManaCurveChart
├── LobbyPage
│   ├── Matchmaking
│   │   ├── QueueStatus
│   │   └── CancelButton
│   └── RecentGames
└── GamePage
    ├── GameBoard
    │   ├── PlayerInfo
    │   │   ├── HealthBar
    │   │   ├── CursedEnergyBar
    │   │   └── Stats
    │   ├── OpponentField
    │   │   ├── OpponentBattlefield
    │   │   └── OpponentGraveyard
    │   ├── MainGameArea
    │   │   ├── Battlefield
    │   │   └── Stack (효과 순서)
    │   ├── MyField
    │   │   ├── Hand
    │   │   └── Graveyard
    │   └── GameControls
    │       ├── ActionButtons
    │       └── GameChat
    └── GameOverModal
        └── GameStats
```

### 2.2 컴포넌트 상세 명세

#### 2.2.1 GameBoard 컴포넌트

```typescript
// src/components/game/GameBoard.tsx

interface GameBoardProps {
  gameId: string;
  playerId: string;
}

interface GameBoardState {
  gameState: GameState;
  selectedCard?: Card;
  targetMode?: 'attack' | 'block' | null;
  gamePhase: GamePhase;
}

const GameBoard: React.FC<GameBoardProps> = ({ gameId, playerId }) => {
  const dispatch = useDispatch();
  const gameState = useSelector(selectGameState);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [targetMode, setTargetMode] = useState<'attack' | 'block' | null>(null);

  // WebSocket 리스너
  useWebSocket(gameId, (event) => {
    dispatch(updateGameState(event.payload));
  });

  const handleCardClick = (card: Card, zone: Zone) => {
    // 손패 카드 클릭 → 플레이 준비
    // 필드 카드 클릭 → 공격 모드 활성화
  };

  const handlePlayCard = (card: Card) => {
    // 서버로 PLAY_CARD 액션 전송
  };

  const handleAttack = (attacker: Card, target: Card | null) => {
    // 서버로 ATTACK 액션 전송
  };

  return (
    <div className="game-board">
      <OpponentInfo player={gameState.player2} />
      <OpponentField {...gameState.player2} />

      <MainGameArea
        gameState={gameState}
        selectedCard={selectedCard}
        targetMode={targetMode}
        onCardClick={handleCardClick}
      />

      <MyField {...gameState.player1} />
      <PlayerInfo player={gameState.player1} />
      <GameControls
        onEndTurn={handleEndTurn}
        currentPhase={gameState.currentPhase}
      />
    </div>
  );
};

export default GameBoard;
```

#### 2.2.2 Hand 컴포넌트

```typescript
// src/components/game/Hand.tsx

interface HandProps {
  cards: Card[];
  playerId: string;
  cursedEnergy: number;
  maxCursedEnergy: number;
  onCardClick: (card: Card) => void;
  selectedCard?: Card;
}

const Hand: React.FC<HandProps> = ({
  cards,
  playerId,
  cursedEnergy,
  onCardClick,
  selectedCard
}) => {
  const [hoveredCard, setHoveredCard] = useState<Card | null>(null);

  return (
    <div className="hand">
      <div className="hand-info">
        <span>손패: {cards.length}장</span>
        <span>저주력: {cursedEnergy}/{maxCursedEnergy}</span>
      </div>

      <div className="hand-cards">
        {cards.map((card, index) => (
          <div
            key={index}
            className={classNames('card-wrapper', {
              'selected': selectedCard?.cardId === card.cardId,
              'disabled': card.cost > cursedEnergy
            })}
            onMouseEnter={() => setHoveredCard(card)}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => onCardClick(card)}
          >
            <CardPreview
              card={card}
              size="small"
              showCost={true}
              playable={card.cost <= cursedEnergy}
            />
          </div>
        ))}
      </div>

      {hoveredCard && (
        <CardDetailPopup
          card={hoveredCard}
          position="top"
        />
      )}
    </div>
  );
};

export default Hand;
```

#### 2.2.3 Battlefield 컴포넌트

```typescript
// src/components/game/Battlefield.tsx

interface BattlefieldProps {
  cards: Card[];
  playerId: string;
  isMyBattlefield: boolean;
  onCardClick: (card: Card) => void;
  selectedCard?: Card;
  targetMode?: 'attack' | 'block' | null;
}

const Battlefield: React.FC<BattlefieldProps> = ({
  cards,
  isMyBattlefield,
  onCardClick,
  selectedCard,
  targetMode
}) => {
  const maxCards = 3;

  return (
    <div className={classNames('battlefield', {
      'my-battlefield': isMyBattlefield,
      'opponent-battlefield': !isMyBattlefield
    })}>
      <div className="battlefield-header">
        {isMyBattlefield ? '나의 필드' : '상대 필드'}
        <span className="card-count">({cards.length}/{maxCards})</span>
      </div>

      <div className="battlefield-cards">
        {Array.from({ length: maxCards }).map((_, index) => {
          const card = cards[index];

          return (
            <div
              key={index}
              className={classNames('card-slot', {
                'occupied': card,
                'target-available':
                  targetMode && card && !isMyBattlefield
              })}
              onClick={() => card && onCardClick(card)}
            >
              {card ? (
                <BattlefieldCard
                  card={card}
                  position={index}
                  isSelected={selectedCard?.cardId === card.cardId}
                  showStats={true}
                  statusEffects={card.statusEffects}
                />
              ) : (
                <div className="empty-slot">빈 슬롯</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Battlefield;
```

---

## 3. State Management (Redux)

### 3.1 Game Slice

```typescript
// src/store/slices/gameSlice.ts

interface GameState {
  gameId: string | null;
  player1: PlayerState;
  player2: PlayerState;
  currentTurn: number;
  currentPhase: GamePhase;
  currentPlayer: 'player1' | 'player2';
  gameStatus: 'waiting' | 'active' | 'ended';
  selectedCard: Card | null;
  targetMode: TargetMode | null;
  actionHistory: GameAction[];
  error: string | null;
}

interface PlayerState {
  playerId: string;
  username: string;
  hp: number;
  maxHp: number;
  cursedEnergy: number;
  maxCursedEnergy: number;
  hand: Card[];
  battlefield: Card[];
  graveyard: Card[];
  deckRemaining: number;
}

const initialState: GameState = {
  gameId: null,
  player1: {
    playerId: '',
    username: '',
    hp: 20,
    maxHp: 20,
    cursedEnergy: 1,
    maxCursedEnergy: 1,
    hand: [],
    battlefield: [],
    graveyard: [],
    deckRemaining: 40
  },
  player2: {
    playerId: '',
    username: '',
    hp: 20,
    maxHp: 20,
    cursedEnergy: 1,
    maxCursedEnergy: 1,
    hand: [],
    battlefield: [],
    graveyard: [],
    deckRemaining: 40
  },
  currentTurn: 1,
  currentPhase: 'DRAW',
  currentPlayer: 'player1',
  gameStatus: 'waiting',
  selectedCard: null,
  targetMode: null,
  actionHistory: [],
  error: null
};

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    updateGameState: (state, action: PayloadAction<GameState>) => {
      return { ...state, ...action.payload };
    },

    playCard: (state, action: PayloadAction<{
      cardId: string;
      targetCardId?: string;
    }>) => {
      // 손패에서 카드 제거
      // 필드에 카드 추가
      // 저주력 차감
    },

    attack: (state, action: PayloadAction<{
      attackerCardId: string;
      targetCardId?: string;
    }>) => {
      // 공격 모드 활성화
      // 선택한 카드 저장
    },

    block: (state, action: PayloadAction<{
      defenderCardId: string;
      attackerCardId: string;
    }>) => {
      // 방어 처리
      // 손상 계산
    },

    endTurn: (state) => {
      state.currentTurn += 1;
      state.currentPlayer = state.currentPlayer === 'player1' ? 'player2' : 'player1';
      state.currentPhase = 'DRAW';

      // 다음 플레이어 저주력 리셋
      const nextPlayer = state.currentPlayer === 'player1' ? state.player1 : state.player2;
      nextPlayer.cursedEnergy = Math.min(nextPlayer.maxCursedEnergy + 1, 10);
    },

    selectCard: (state, action: PayloadAction<Card | null>) => {
      state.selectedCard = action.payload;
    },

    setTargetMode: (state, action: PayloadAction<TargetMode | null>) => {
      state.targetMode = action.payload;
    },

    addActionToHistory: (state, action: PayloadAction<GameAction>) => {
      state.actionHistory.push(action.payload);
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    }
  }
});

export const {
  updateGameState,
  playCard,
  attack,
  block,
  endTurn,
  selectCard,
  setTargetMode,
  addActionToHistory,
  setError
} = gameSlice.actions;

export default gameSlice.reducer;
```

### 3.2 WebSocket Middleware

```typescript
// src/store/middleware/wsMiddleware.ts

export const wsMiddleware = (ws: WebSocket) => (store) => (next) => (action) => {
  next(action);

  // 클라이언트 액션 → 서버로 전송
  const clientActions = [
    'PLAY_CARD',
    'ATTACK',
    'BLOCK',
    'END_TURN',
    'SURRENDER'
  ];

  if (clientActions.includes(action.type)) {
    ws.send(JSON.stringify({
      type: action.type,
      payload: action.payload,
      timestamp: Date.now()
    }));
  }

  // 서버 메시지 → 스토어 업데이트
  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);

    switch (message.type) {
      case 'GAME_STATE_UPDATE':
        store.dispatch(updateGameState(message.payload));
        break;
      case 'PLAY_CARD':
        store.dispatch(playCard(message.payload));
        break;
      case 'GAME_ENDED':
        store.dispatch(setGameEnded(message.payload));
        break;
      case 'ERROR':
        store.dispatch(setError(message.payload.message));
        break;
    }
  };
};
```

---

## 4. Custom Hooks

### 4.1 useGame Hook

```typescript
// src/hooks/useGame.ts

interface UseGameReturn {
  gameState: GameState;
  playCard: (card: Card) => Promise<void>;
  attack: (attacker: Card, target?: Card) => Promise<void>;
  block: (defender: Card, attacker: Card) => Promise<void>;
  endTurn: () => Promise<void>;
  surrender: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const useGame = (gameId: string): UseGameReturn => {
  const dispatch = useDispatch();
  const gameState = useSelector(selectGameState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsService = useRef<WebSocketService | null>(null);

  useEffect(() => {
    // WebSocket 연결
    wsService.current = new WebSocketService(gameId);

    wsService.current.on('GAME_STATE_UPDATE', (data) => {
      dispatch(updateGameState(data));
    });

    return () => {
      wsService.current?.disconnect();
    };
  }, [gameId, dispatch]);

  const playCard = useCallback(async (card: Card) => {
    try {
      setIsLoading(true);
      wsService.current?.send('PLAY_CARD', { cardId: card.cardId });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const attack = useCallback(async (attacker: Card, target?: Card) => {
    try {
      setIsLoading(true);
      wsService.current?.send('ATTACK', {
        attackerCardId: attacker.cardId,
        targetCardId: target?.cardId
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const block = useCallback(async (defender: Card, attacker: Card) => {
    try {
      setIsLoading(true);
      wsService.current?.send('BLOCK', {
        defenderCardId: defender.cardId,
        attackerCardId: attacker.cardId
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const endTurn = useCallback(async () => {
    try {
      setIsLoading(true);
      wsService.current?.send('END_TURN', {});
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const surrender = useCallback(async () => {
    try {
      setIsLoading(true);
      wsService.current?.send('SURRENDER', {});
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    gameState,
    playCard,
    attack,
    block,
    endTurn,
    surrender,
    isLoading,
    error
  };
};
```

### 4.2 useWebSocket Hook

```typescript
// src/hooks/useWebSocket.ts

interface UseWebSocketReturn {
  connected: boolean;
  lastMessage: any | null;
  send: (type: string, payload: any) => void;
  subscribe: (event: string, callback: Function) => void;
}

export const useWebSocket = (gameId: string): UseWebSocketReturn => {
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const wsRef = useRef<WebSocketService | null>(null);
  const subscribersRef = useRef<Map<string, Function[]>>(new Map());

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    wsRef.current = new WebSocketService(
      `${WS_URL}?token=${token}&gameId=${gameId}`
    );

    wsRef.current.onopen = () => setConnected(true);
    wsRef.current.onclose = () => setConnected(false);
    wsRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setLastMessage(message);

      // 구독자에게 알림
      const callbacks = subscribersRef.current.get(message.type) || [];
      callbacks.forEach(cb => cb(message));
    };

    return () => wsRef.current?.close();
  }, [gameId]);

  const send = useCallback((type: string, payload: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type,
        payload,
        timestamp: Date.now()
      }));
    }
  }, []);

  const subscribe = useCallback((event: string, callback: Function) => {
    if (!subscribersRef.current.has(event)) {
      subscribersRef.current.set(event, []);
    }
    subscribersRef.current.get(event)!.push(callback);

    return () => {
      const callbacks = subscribersRef.current.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) callbacks.splice(index, 1);
      }
    };
  }, []);

  return { connected, lastMessage, send, subscribe };
};
```

---

## 5. API 서비스

### 5.1 API Client 설정

```typescript
// src/services/api.ts

import axios, { AxiosInstance } from 'axios';

const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Request 인터셉터 (토큰 자동 추가)
  client.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Response 인터셉터 (에러 처리)
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // 토큰 만료 → 재로그인
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return client;
};

export const api = createApiClient();
```

### 5.2 게임 서비스

```typescript
// src/services/gameService.ts

export const gameService = {
  getCards: async (filters?: CardFilters) => {
    const response = await api.get('/cards', { params: filters });
    return response.data;
  },

  getCard: async (cardId: string) => {
    const response = await api.get(`/cards/${cardId}`);
    return response.data;
  },

  getDecks: async () => {
    const response = await api.get('/decks');
    return response.data;
  },

  createDeck: async (deckData: CreateDeckDTO) => {
    const response = await api.post('/decks', deckData);
    return response.data;
  },

  updateDeck: async (deckId: string, deckData: UpdateDeckDTO) => {
    const response = await api.patch(`/decks/${deckId}`, deckData);
    return response.data;
  },

  deleteDeck: async (deckId: string) => {
    const response = await api.delete(`/decks/${deckId}`);
    return response.data;
  },

  joinMatchmaking: async (deckId: string, gameMode: GameMode) => {
    const response = await api.post('/matchmaking/join', {
      deckId,
      gameMode
    });
    return response.data;
  },

  cancelMatchmaking: async (queueId: string) => {
    const response = await api.delete(`/matchmaking/queue/${queueId}`);
    return response.data;
  }
};
```

---

## 6. 와이어프레임 및 화면 구성

### 6.1 게임 화면 레이아웃

```
┌─────────────────────────────────────────┐
│  상대방 정보 (체력, 저주력)              │
├─────────────────────────────────────────┤
│                                         │
│  상대 필드 (최대 3개 저주술사)           │
│  ┌──────┐ ┌──────┐ ┌──────┐           │
│  │      │ │      │ │      │           │
│  └──────┘ └──────┘ └──────┘           │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  메인 게임 영역                         │
│  (선택된 카드 미리보기, 스택)           │
│                                         │
├─────────────────────────────────────────┤
│  나의 필드 (최대 3개 저주술사)          │
│  ┌──────┐ ┌──────┐ ┌──────┐           │
│  │      │ │      │ │      │           │
│  └──────┘ └──────┘ └──────┘           │
│                                         │
├─────────────────────────────────────────┤
│  나의 정보 (체력, 저주력)                │
├─────────────────────────────────────────┤
│  손패 카드 (좌우 스크롤)                 │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ │
│  │    │ │    │ │    │ │    │ │    │ │
│  └────┘ └────┘ └────┘ └────┘ └────┘ │
│                                         │
├─────────────────────────────────────────┤
│  [턴 종료]  [포기]  [설정]  [채팅]      │
└─────────────────────────────────────────┘
```

### 6.2 덱 빌더 화면

```
┌────────────────────────────────────────┐
│  덱 이름: ________________             │
├────────────────────────────────────────┤
│ [카드 검색] ________________            │
├────────────┬────────────────────────────┤
│ 검색 결과:  │ 현재 덱:                  │
│            │                           │
│ [카드 1]   │ 저주술사 (5장)           │
│ [카드 2]   │ ┌─────────────────┐      │
│ [카드 3]   │ │ - 유토 김 (2)   │      │
│ ...        │ │ - 메이 (3)      │      │
│            │ │                 │      │
│            │ 주술 (18장)              │
│            │ ┌─────────────────┐      │
│            │ │ - 대알 (3)      │      │
│            │ │ - ...           │      │
│            │ │                 │      │
│            │ 마나 커브:              │
│            │ ████░░░░░░░░░░░░░░░░   │
├────────────┴────────────────────────────┤
│ 총 45/60 카드 | 마나 평균: 3.2         │
│ [저장]  [초기화]  [공유]  [삭제]        │
└────────────────────────────────────────┘
```

---

## 7. 성능 최적화

### 7.1 코드 분할

```typescript
// src/App.tsx

import { lazy, Suspense } from 'react';

const HomePage = lazy(() => import('./pages/HomePage'));
const GamePage = lazy(() => import('./pages/GamePage'));
const DeckBuilderPage = lazy(() => import('./pages/DeckBuilderPage'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/game/:gameId" element={<GamePage />} />
        <Route path="/deck-builder" element={<DeckBuilderPage />} />
      </Routes>
    </Suspense>
  );
}
```

### 7.2 메모이제이션

```typescript
// 불필요한 리렌더링 방지
const Card = memo(({ card, onClick }: CardProps) => (
  <div className="card" onClick={() => onClick(card)}>
    {/* ... */}
  </div>
));

// useMemo와 useCallback 활용
const Hand = ({ cards, cursedEnergy }: HandProps) => {
  const playableCards = useMemo(
    () => cards.filter(c => c.cost <= cursedEnergy),
    [cards, cursedEnergy]
  );

  const handleClick = useCallback((card: Card) => {
    // ...
  }, []);

  return <div>{/* ... */}</div>;
};
```

---

## 8. 접근성 (Accessibility)

```typescript
// WCAG 2.1 AA 준수

<button
  aria-label="턴 종료"
  aria-describedby="turn-end-help"
  disabled={!canEndTurn}
  onClick={handleEndTurn}
>
  턴 종료
</button>

<div role="alert" aria-live="polite">
  {errorMessage}
</div>

<div role="region" aria-label="게임 상태">
  {/* 게임 정보 */}
</div>
```

---

**다음 문서**: `TDD/07-backend-game-logic.md`
