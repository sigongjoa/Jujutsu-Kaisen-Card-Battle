# TDD 05: Testing Strategy & Definition of Done

**문서 분류**: TDD (Technical Design Document)
**작성자**: QA & Engineering Team
**최종 업데이트**: 2025-11-30
**상태**: Production Ready

---

## 1. 테스팅 전략 개요

### 1.1 테스트 피라미드

```
                    🔺 E2E Tests
                   /          \
                  /            \ (5%)
                 /──────────────\
                /   Integration   \
               /    Tests (15%)     \
              /─────────────────────\
             /      Unit Tests       \
            /       (80%)             \
           /────────────────────────────\
```

### 1.2 테스트 목표

```
Unit Tests:       > 80% 코드 커버리지
Integration:      모든 API 엔드포인트
E2E:              주요 게임플로우
Performance:      응답시간 < 200ms
Load:             1000 동시 접속 지원
```

### 1.3 테스트 환경

```
Development:  로컬 (npm test)
CI/CD:        GitHub Actions
Staging:      실제와 동일한 환경
Production:   Monitoring only
```

---

## 2. 백엔드 테스팅 (Python/Node.js)

### 2.1 단위 테스트 (Unit Tests)

#### 2.1.1 Jest/Pytest 설정

```bash
# 설치
npm install --save-dev jest supertest
# 또는
pip install pytest pytest-cov pytest-asyncio

# 실행
npm test
# 또는
pytest --cov=src --cov-report=html

# 커버리지 목표
Coverage: > 80%
Lines: > 85%
Branches: > 75%
```

#### 2.1.2 단위 테스트 예시 (Authentication)

```javascript
// tests/unit/auth.test.js

const { register, login } = require('../../src/services/auth');
const User = require('../../src/models/User');

jest.mock('../../src/models/User');

describe('Auth Service', () => {

  describe('register', () => {
    it('should create a new user with valid credentials', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'SecurePass123!'
      };

      User.create.mockResolvedValue({
        userId: 'uuid-1',
        ...userData
      });

      const result = await register(userData);

      expect(result.userId).toBeDefined();
      expect(User.create).toHaveBeenCalledWith(userData);
    });

    it('should reject weak password', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: '123'
      };

      await expect(register(userData)).rejects.toThrow('Password too weak');
    });

    it('should reject duplicate username', async () => {
      User.create.mockRejectedValue(new Error('Username already exists'));

      await expect(register({...})).rejects.toThrow('Username already exists');
    });
  });

  describe('login', () => {
    it('should return tokens on valid credentials', async () => {
      const user = {
        userId: 'uuid-1',
        email: 'test@example.com',
        password_hash: 'hashed_password'
      };

      User.findByEmail.mockResolvedValue(user);

      const result = await login('test@example.com', 'SecurePass123!');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should fail on invalid credentials', async () => {
      User.findByEmail.mockResolvedValue(null);

      await expect(login('notfound@example.com', 'password'))
        .rejects.toThrow('Invalid credentials');
    });
  });
});
```

#### 2.1.3 게임 로직 단위 테스트

```javascript
// tests/unit/gameLogic.test.js

const GameLogic = require('../../src/services/GameLogic');

describe('Game Logic', () => {

  let game;

  beforeEach(() => {
    game = new GameLogic({
      player1Id: 'p1-uuid',
      player2Id: 'p2-uuid',
      deck1: mockDeck(),
      deck2: mockDeck()
    });
  });

  describe('playCard', () => {
    it('should play card with sufficient cursed energy', () => {
      game.currentCursedEnergy = 5;
      const card = { cardId: 'SET01-001', cost: 3 };

      const result = game.playCard('p1-uuid', card);

      expect(result.success).toBe(true);
      expect(game.currentCursedEnergy).toBe(2);
      expect(game.battlefield.length).toBe(1);
    });

    it('should reject card with insufficient cursed energy', () => {
      game.currentCursedEnergy = 2;
      const card = { cardId: 'SET01-001', cost: 5 };

      const result = game.playCard('p1-uuid', card);

      expect(result.success).toBe(false);
      expect(result.error).toBe('insufficient_cursed_energy');
    });

    it('should enforce max 1 character per turn', () => {
      game.currentCursedEnergy = 20;
      const char1 = { cardId: 'SET01-001', cost: 3, type: 'JUJUTSU_USER' };
      const char2 = { cardId: 'SET01-002', cost: 2, type: 'JUJUTSU_USER' };

      game.playCard('p1-uuid', char1);
      const result = game.playCard('p1-uuid', char2);

      expect(result.success).toBe(false);
      expect(result.error).toBe('max_characters_exceeded');
    });
  });

  describe('attack', () => {
    beforeEach(() => {
      game.currentCursedEnergy = 10;
      game.playCard('p1-uuid', { cardId: 'SET01-001', cost: 3 });
    });

    it('should calculate damage correctly', () => {
      const attacker = game.battlefield[0]; // atk: 3
      const damage = game.calculateDamage(attacker, null);

      expect(damage).toBe(3);
    });

    it('should apply block correctly', () => {
      const attacker = game.battlefield[0];
      const defender = { cardId: 'SET01-002', atk: 2, hp: 4 };

      const result = game.block(attacker, defender);

      expect(result.attackerDamage).toBe(2);
      expect(result.defenderDamage).toBe(3);
    });
  });

  describe('turnEnd', () => {
    it('should reset cursed energy at turn start', () => {
      game.currentCursedEnergy = 0;
      game.nextTurn();

      expect(game.currentCursedEnergy).toBe(2);  // 턴 2에는 2
    });

    it('should increment turn counter', () => {
      const initialTurn = game.currentTurn;

      game.nextTurn();

      expect(game.currentTurn).toBe(initialTurn + 1);
    });
  });
});

function mockDeck() {
  return {
    cards: Array(40).fill({ cardId: 'SET01-001', cost: 1 }),
    shuffle() { /* ... */ }
  };
}
```

---

### 2.2 통합 테스트 (Integration Tests)

#### 2.2.1 API 통합 테스트

```javascript
// tests/integration/api.test.js

const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/database');

describe('API Integration Tests', () => {

  beforeAll(async () => {
    await db.connect();
  });

  afterAll(async () => {
    await db.disconnect();
  });

  afterEach(async () => {
    await db.cleanTestData();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'SecurePass123!'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.userId).toBeDefined();
    });

    it('should return 409 for duplicate username', async () => {
      // 첫 번째 유저 생성
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'duplicate',
          email: 'first@example.com',
          password: 'SecurePass123!'
        });

      // 같은 username으로 등록 시도
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'duplicate',
          email: 'second@example.com',
          password: 'SecurePass123!'
        });

      expect(res.statusCode).toBe(409);
      expect(res.body.error.code).toBe('USERNAME_EXISTS');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'logintest',
          email: 'login@example.com',
          password: 'SecurePass123!'
        });
    });

    it('should return tokens on valid login', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'SecurePass123!'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
    });

    it('should return 401 on invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'WrongPassword123!'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('GET /api/cards', () => {
    it('should return paginated cards', async () => {
      const res = await request(app)
        .get('/api/cards?page=1&limit=20');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.cards).toHaveLength(20);
      expect(res.body.data.pagination.page).toBe(1);
      expect(res.body.data.pagination.total).toBeGreaterThan(0);
    });

    it('should filter by card type', async () => {
      const res = await request(app)
        .get('/api/cards?type=JUJUTSU_USER&limit=100');

      expect(res.statusCode).toBe(200);
      res.body.data.cards.forEach(card => {
        expect(card.type).toBe('JUJUTSU_USER');
      });
    });
  });

  describe('POST /api/decks', () => {
    let accessToken;

    beforeEach(async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!'
        });

      accessToken = loginRes.body.data.accessToken;
    });

    it('should create a valid deck', async () => {
      const deckData = {
        name: 'Test Deck',
        cards: Array(40).fill({ cardId: 'SET01-001', quantity: 1 })
      };

      const res = await request(app)
        .post('/api/decks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(deckData);

      expect(res.statusCode).toBe(201);
      expect(res.body.data.deckId).toBeDefined();
      expect(res.body.data.cardCount).toBe(40);
    });

    it('should reject deck with wrong card count', async () => {
      const deckData = {
        name: 'Test Deck',
        cards: Array(25).fill({ cardId: 'SET01-001', quantity: 1 })
      };

      const res = await request(app)
        .post('/api/decks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(deckData);

      expect(res.statusCode).toBe(422);
      expect(res.body.error.code).toBe('DECK_SIZE_INVALID');
    });
  });
});
```

---

### 2.3 게임 시나리오 테스트

```javascript
// tests/integration/gameScenario.test.js

describe('Game Scenario Tests', () => {

  it('should complete a full game from start to end', async () => {
    // 1. 두 플레이어 생성
    const p1 = await createTestUser('player1');
    const p2 = await createTestUser('player2');

    // 2. 덱 생성
    const deck1 = await createTestDeck(p1.userId, mockDeck());
    const deck2 = await createTestDeck(p2.userId, mockDeck());

    // 3. 매칭
    const gameRes = await request(app)
      .post('/api/matchmaking/join')
      .set('Authorization', `Bearer ${p1.token}`)
      .send({ deckId: deck1.deckId, gameMode: 'CASUAL' });

    const matchRes = await request(app)
      .post('/api/matchmaking/join')
      .set('Authorization', `Bearer ${p2.token}`)
      .send({ deckId: deck2.deckId, gameMode: 'CASUAL' });

    // 4. 게임 시작
    const gameId = getGameIdFromMatchmaking(gameRes, matchRes);

    // 5. WebSocket으로 게임 플레이
    const ws = new WebSocket(`wss://localhost:3000/ws?token=${p1.token}&gameId=${gameId}`);

    await new Promise((resolve, reject) => {
      ws.onopen = () => {
        // 게임 시작
        ws.send(JSON.stringify({ type: 'GAME_START', gameId }));
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);

        if (message.type === 'GAME_STARTED') {
          // 카드 플레이
          ws.send(JSON.stringify({
            type: 'PLAY_CARD',
            gameId,
            payload: { cardId: 'SET01-001' }
          }));
        }

        if (message.type === 'GAME_ENDED') {
          expect(message.payload.winnerId).toBeDefined();
          ws.close();
          resolve();
        }
      };

      ws.onerror = (error) => reject(error);
      setTimeout(() => reject(new Error('Timeout')), 60000);
    });
  });
});
```

---

### 2.4 성능 테스트

```javascript
// tests/performance/performance.test.js

const { performance } = require('perf_hooks');

describe('Performance Tests', () => {

  it('should return cards list in < 200ms', async () => {
    const start = performance.now();

    const res = await request(app)
      .get('/api/cards?limit=100');

    const duration = performance.now() - start;

    expect(res.statusCode).toBe(200);
    expect(duration).toBeLessThan(200);  // 200ms 이내
  });

  it('should handle 1000 concurrent users', async () => {
    const requests = Array(1000).fill(null).map(() =>
      request(app).get('/api/cards?limit=20')
    );

    const start = performance.now();
    const results = await Promise.all(requests);
    const duration = performance.now() - start;

    results.forEach(res => {
      expect(res.statusCode).toBe(200);
    });

    console.log(`1000 requests completed in ${duration}ms`);
    // 평균: < 100ms per request
    expect(duration / 1000).toBeLessThan(100);
  });
});
```

---

## 3. 프론트엔드 테스팅 (React/Vue)

### 3.1 Component Unit Tests (Jest + React Testing Library)

```javascript
// tests/components/CardList.test.js

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CardList from '../../src/components/CardList';

describe('CardList Component', () => {

  it('should render card list', async () => {
    const mockCards = [
      { cardId: 'SET01-001', nameKr: '유토 김', cost: 5 },
      { cardId: 'SET01-002', nameKr: '메이', cost: 3 }
    ];

    render(<CardList cards={mockCards} />);

    expect(screen.getByText('유토 김')).toBeInTheDocument();
    expect(screen.getByText('메이')).toBeInTheDocument();
  });

  it('should handle card click', async () => {
    const mockCards = [
      { cardId: 'SET01-001', nameKr: '유토 김', cost: 5 }
    ];
    const onCardClick = jest.fn();

    render(<CardList cards={mockCards} onCardClick={onCardClick} />);

    const cardElement = screen.getByText('유토 김');
    await userEvent.click(cardElement);

    expect(onCardClick).toHaveBeenCalledWith('SET01-001');
  });

  it('should paginate correctly', async () => {
    const mockCards = Array(100).fill(null).map((_, i) => ({
      cardId: `SET01-${String(i+1).padStart(3, '0')}`,
      nameKr: `카드 ${i+1}`,
      cost: Math.floor(Math.random() * 10)
    }));

    render(<CardList cards={mockCards} itemsPerPage={20} />);

    // 첫 페이지: 20개 카드 표시
    expect(screen.getAllByRole('article')).toHaveLength(20);

    // 다음 페이지 클릭
    const nextButton = screen.getByText('Next');
    await userEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('카드 21')).toBeInTheDocument();
    });
  });
});
```

### 3.2 Redux/State Management Tests

```javascript
// tests/store/gameSlice.test.js

import gameReducer, {
  playCard,
  attack,
  endTurn
} from '../../src/store/gameSlice';

describe('Game Redux Slice', () => {

  const initialState = {
    gameId: 'game-uuid',
    currentPlayer: 'p1',
    p1: { hp: 20, cursedEnergy: 1, hand: [], battlefield: [] },
    p2: { hp: 20, cursedEnergy: 1, hand: [], battlefield: [] },
    currentTurn: 1,
    currentPhase: 'DRAW'
  };

  it('should play a card correctly', () => {
    const state = { ...initialState };
    state.p1.hand = [{ cardId: 'SET01-001', cost: 1 }];
    state.p1.cursedEnergy = 5;

    const action = playCard({
      playerId: 'p1',
      cardId: 'SET01-001'
    });

    const newState = gameReducer(state, action);

    expect(newState.p1.cursedEnergy).toBe(4);
    expect(newState.p1.hand).toHaveLength(0);
    expect(newState.p1.battlefield).toHaveLength(1);
  });

  it('should prevent playing card without energy', () => {
    const state = { ...initialState };
    state.p1.hand = [{ cardId: 'SET01-001', cost: 5 }];
    state.p1.cursedEnergy = 2;

    const action = playCard({
      playerId: 'p1',
      cardId: 'SET01-001'
    });

    // Redux에서 미들웨어가 차단하거나, 실패 상태 반환
    const newState = gameReducer(state, action);
    expect(newState.p1.hand).toHaveLength(1);  // 변화 없음
  });

  it('should end turn correctly', () => {
    const state = { ...initialState };
    state.currentTurn = 1;
    state.currentPlayer = 'p1';

    const action = endTurn();
    const newState = gameReducer(state, action);

    expect(newState.currentTurn).toBe(2);
    expect(newState.currentPlayer).toBe('p2');
    expect(newState.p2.cursedEnergy).toBe(2);  // 새로운 턴에 리셋
  });
});
```

### 3.3 E2E 테스트 (Cypress)

```javascript
// tests/e2e/gameFlow.cy.js

describe('Complete Game Flow E2E', () => {

  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('should complete login, deck select, and start game', () => {
    // 1. 로그인
    cy.contains('로그인').click();
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('SecurePass123!');
    cy.contains('로그인 하기').click();

    cy.contains('게임 시작').should('be.visible');

    // 2. 덱 선택
    cy.get('[data-testid="deck-selector"]').click();
    cy.contains('My First Deck').click();

    // 3. 게임 시작 요청
    cy.contains('매칭 시작').click();

    // 4. 매칭 대기
    cy.contains('플레이어를 찾는 중', { timeout: 30000 }).should('be.visible');

    // 5. 게임 시작
    cy.contains('게임 시작됨', { timeout: 60000 }).should('be.visible');

    // 6. 게임 플레이
    cy.get('[data-testid="hand-card"]').first().click();
    cy.get('[data-testid="battlefield"]').should('contain', '유토 김');

    // 7. 공격
    cy.get('[data-testid="card-on-battlefield"]').click();
    cy.get('[data-testid="attack-button"]').click();

    // 8. 턴 종료
    cy.contains('턴 종료').click();

    // 상대방 턴 대기
    cy.contains('상대방 턴', { timeout: 5000 }).should('be.visible');
  });

  it('should handle game end correctly', () => {
    // ... 게임 시작 코드 ...

    // 게임이 끝날 때까지 플레이
    cy.contains('게임 종료', { timeout: 600000 }).should('be.visible');

    // 결과 화면 확인
    cy.contains('승리|패배', { timeout: 5000 }).should('be.visible');
    cy.get('[data-testid="game-stats"]').should('contain', '게임 시간');
  });
});
```

---

## 4. Definition of Done (DoD)

### 4.1 모든 Issue/PR에 대한 DoD

```
✅ Code Requirements
  [ ] 코드 작성 완료
  [ ] 코딩 컨벤션 준수 (ESLint/Prettier)
  [ ] 타입 체크 통과 (TypeScript)
  [ ] 주석 추가 (복잡한 로직)

✅ Testing Requirements
  [ ] Unit tests 작성 (80%+ 커버리지)
  [ ] Integration tests 통과
  [ ] 수동 테스트 완료
  [ ] Edge case 테스트

✅ Code Review
  [ ] 2명 이상의 코드 리뷰 완료
  [ ] 모든 피드백 처리
  [ ] 린트 오류 해결

✅ Documentation
  [ ] README 업데이트 (필요시)
  [ ] API 명세 업데이트 (백엔드)
  [ ] 컴포넌트 문서 업데이트 (프론트)

✅ Performance
  [ ] 성능 회귀 없음
  [ ] 번들 크기 증가 없음 (< 5KB)
  [ ] 응답 시간 < 200ms

✅ Security
  [ ] 보안 취약점 검사 통과
  [ ] 의존성 취약점 없음
  [ ] SQL 인젝션 방지

✅ Deployment
  [ ] 마이그레이션 스크립트 (필요시)
  [ ] 롤백 계획
  [ ] 모니터링 설정
```

### 4.2 Features/기능별 DoD

```
Feature: 게임 플레이 기능

✅ Functional
  [ ] 모든 게임 액션 구현
  [ ] 규칙 엔진 검증
  [ ] WebSocket 실시간 통신
  [ ] 게임 상태 저장

✅ User Experience
  [ ] 로딩 상태 표시
  [ ] 에러 메시지 명확
  [ ] 장치 회전 지원 (모바일)

✅ Testing
  [ ] 게임 시나리오 테스트 완료
  [ ] 1000 동시 게임 테스트
  [ ] 네트워크 지연 시뮬레이션 테스트

✅ Performance
  [ ] 게임 상태 업데이트: < 100ms
  [ ] 액션 처리: < 50ms
  [ ] 메모리 사용: < 500MB

✅ Documentation
  [ ] API 엔드포인트 문서화
  [ ] WebSocket 이벤트 명세
  [ ] 게임 규칙 명확화
```

---

## 5. 테스트 실행 명령어

### 5.1 로컬 개발

```bash
# 모든 테스트 실행
npm test

# 단위 테스트만
npm run test:unit

# 통합 테스트만
npm run test:integration

# E2E 테스트만
npm run test:e2e

# 커버리지 리포트
npm run test:coverage

# Watch mode (파일 변경 감지)
npm test -- --watch
```

### 5.2 CI/CD 파이프라인

```yaml
# .github/workflows/test.yml

name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run unit tests
        run: npm run test:unit -- --coverage

      - name: Run integration tests
        run: npm run test:integration

      - name: Upload coverage
        uses: codecov/codecov-action@v2
        with:
          files: ./coverage/coverage-final.json

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Report results
        if: always()
        run: npm run test:report
```

---

## 6. 테스트 커버리지 목표

| 모듈 | 목표 | 현재 |
|------|------|------|
| Auth Service | 90% | - |
| Game Logic | 85% | - |
| Card Service | 85% | - |
| User Service | 80% | - |
| WebSocket Handler | 75% | - |
| Components | 80% | - |
| **전체** | **80%** | **0%** |

---

**다음 문서**: `TDD/06-frontend-architecture.md`
