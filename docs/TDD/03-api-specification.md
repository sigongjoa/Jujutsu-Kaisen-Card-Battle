# TDD 03: API Specification & Network Communication

**문서 분류**: TDD (Technical Design Document)
**작성자**: Backend Architecture Team
**최종 업데이트**: 2025-11-30
**상태**: Production Ready

---

## 1. API 개요 및 기본 설정

### 1.1 기본 정보

```
Base URL (Dev):     http://localhost:3000/api
Base URL (Staging): https://staging.jkcard.dev/api
Base URL (Prod):    https://api.jkcard.dev/api

API Version:        v1
Documentation:      https://api-docs.jkcard.dev
Rate Limit:         100 requests/minute per user
Timeout:            30 seconds
```

### 1.2 인증 방식

```
Type:               Bearer Token (JWT)
Header:             Authorization: Bearer {token}
Token Type:         HS256
Expiration:         1 hour (Access Token)
Refresh Token:      7 days
```

### 1.3 응답 포맷

모든 API 응답은 다음 포맷을 따릅니다:

```json
{
  "status": "success|error|validation_error",
  "data": {...},
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {...}
  },
  "timestamp": "2025-11-30T10:30:00Z",
  "requestId": "uuid-v4"
}
```

---

## 2. REST API 엔드포인트 명세

### 2.1 인증 (Authentication)

#### 2.1.1 회원가입

```
POST /auth/register
Content-Type: application/json

Request Body:
{
  "username": "string (3-50 chars, alphanumeric+underscore)",
  "email": "string (valid email)",
  "password": "string (min 8 chars, upper+lower+number+special)",
  "displayName": "string (optional)"
}

Response (201 Created):
{
  "status": "success",
  "data": {
    "userId": "uuid",
    "username": "username",
    "email": "user@example.com",
    "displayName": "Display Name",
    "createdAt": "2025-11-30T10:30:00Z"
  }
}

Error Responses:
409 Conflict:
  - username already exists
  - email already registered

422 Unprocessable Entity:
  - invalid email format
  - password too weak
  - username contains invalid characters
```

#### 2.1.2 로그인

```
POST /auth/login
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "password": "password123!",
  "deviceId": "string (optional, for tracking)"
}

Response (200 OK):
{
  "status": "success",
  "data": {
    "accessToken": "jwt_token_here",
    "refreshToken": "refresh_token_here",
    "expiresIn": 3600,
    "user": {
      "userId": "uuid",
      "username": "username",
      "email": "user@example.com"
    }
  }
}

Error Responses:
401 Unauthorized:
  - invalid credentials
  - account locked (5+ failed attempts)
```

#### 2.1.3 토큰 갱신

```
POST /auth/refresh
Content-Type: application/json
Authorization: Bearer {refreshToken}

Response (200 OK):
{
  "status": "success",
  "data": {
    "accessToken": "new_jwt_token",
    "expiresIn": 3600
  }
}

Error Responses:
401 Unauthorized:
  - refresh token expired
  - refresh token invalid
```

---

### 2.2 카드 (Cards)

#### 2.2.1 모든 카드 조회

```
GET /cards
Query Parameters:
  - type: JUJUTSU_USER|CURSED_TECHNIQUE|... (optional)
  - rarity: COMMON|UNCOMMON|RARE|ULTRA_RARE (optional)
  - cost: 0-10 (optional)
  - setCode: SET01|SET02 (optional)
  - page: integer (default: 1)
  - limit: integer (default: 50, max: 100)
  - search: string (optional, searches name)

Response (200 OK):
{
  "status": "success",
  "data": {
    "cards": [
      {
        "cardId": "SET01-001",
        "nameEn": "Yuto Kim",
        "nameKr": "유토 김",
        "type": "JUJUTSU_USER",
        "subType": "1st-Grade",
        "rarity": "RARE",
        "cost": 5,
        "stats": {
          "atk": 3,
          "hp": 4
        },
        "textRules": "When this card enters the battlefield...",
        "keywords": ["Destruction"],
        "illustrationUrl": "https://cdn.jkcard.dev/cards/SET01-001.jpg",
        "setCode": "SET01",
        "releaseDate": "2025-12-01"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 200,
      "totalPages": 4
    }
  }
}
```

#### 2.2.2 카드 상세 조회

```
GET /cards/{cardId}

Response (200 OK):
{
  "status": "success",
  "data": {
    "cardId": "SET01-001",
    "nameEn": "Yuto Kim",
    "nameKr": "유토 김",
    "type": "JUJUTSU_USER",
    "rarity": "RARE",
    "cost": 5,
    "stats": {
      "atk": 3,
      "hp": 4,
      "powerScore": 1.2
    },
    "textRules": "When this card enters the battlefield...",
    "flavorText": "Lorem ipsum dolor...",
    "keywords": ["Destruction"],
    "illustrationUrl": "https://cdn.jkcard.dev/cards/SET01-001.jpg",
    "artistName": "Artist Name",
    "setCode": "SET01",
    "cardNumber": 1,
    "releaseDate": "2025-12-01",
    "isLegal": true,
    "synergies": [
      {
        "cardId": "SET01-042",
        "nameKr": "대알",
        "synergyType": "combo"
      }
    ]
  }
}
```

---

### 2.3 유저 컬렉션 (User Collections)

#### 2.3.1 사용자 컬렉션 조회

```
GET /collections
Authorization: Required
Query Parameters:
  - setCode: string (optional)
  - page: integer (default: 1)
  - limit: integer (default: 50)

Response (200 OK):
{
  "status": "success",
  "data": {
    "totalCards": 145,
    "totalUniqueCards": 120,
    "collectionCompletion": 60.0,
    "collections": [
      {
        "collectionId": "uuid",
        "cardId": "SET01-001",
        "cardName": "Yuto Kim",
        "quantity": 2,
        "acquiredDate": "2025-11-15T10:30:00Z",
        "setCode": "SET01"
      }
    ]
  }
}
```

#### 2.3.2 카드 추가/수정 (모의 - 실제로는 서버에서 생성)

```
POST /collections/{cardId}
Authorization: Required
Content-Type: application/json

Request Body:
{
  "quantity": 2
}

Response (201 Created):
{
  "status": "success",
  "data": {
    "collectionId": "uuid",
    "cardId": "SET01-001",
    "quantity": 2,
    "acquiredDate": "2025-11-30T10:30:00Z"
  }
}
```

---

### 2.4 덱 (Decks)

#### 2.4.1 덱 생성

```
POST /decks
Authorization: Required
Content-Type: application/json

Request Body:
{
  "name": "string (max 100 chars)",
  "description": "string (optional)",
  "primaryColor": "string (optional)",
  "cards": [
    {
      "cardId": "SET01-001",
      "quantity": 2
    },
    {
      "cardId": "SET01-042",
      "quantity": 3
    }
  ]
}

Validation Rules:
- Deck must have 40-60 cards total
- Each card max 3 copies (except certain cards max 1)
- At least 50% of different card types

Response (201 Created):
{
  "status": "success",
  "data": {
    "deckId": "uuid",
    "userId": "uuid",
    "name": "My First Deck",
    "cardCount": 45,
    "manaCurveAvg": 3.2,
    "createdAt": "2025-11-30T10:30:00Z",
    "updatedAt": "2025-11-30T10:30:00Z",
    "isPublic": false
  }
}

Error Responses:
422 Unprocessable Entity:
  - deck_size_invalid (not 40-60)
  - card_limit_exceeded (more than 3 of same card)
  - invalid_cards (card does not exist)
```

#### 2.4.2 덱 조회

```
GET /decks/{deckId}
Authorization: Required (if not public)

Response (200 OK):
{
  "status": "success",
  "data": {
    "deckId": "uuid",
    "userId": "uuid",
    "name": "My First Deck",
    "description": "Deck description",
    "cardCount": 45,
    "cards": [
      {
        "deckCardId": "uuid",
        "cardId": "SET01-001",
        "cardName": "Yuto Kim",
        "quantity": 2,
        "cost": 5
      }
    ],
    "manaCurve": {
      "0": 2,
      "1": 3,
      "2": 5,
      "3": 8,
      ...
      "10": 1
    },
    "createdAt": "2025-11-30T10:30:00Z",
    "updatedAt": "2025-11-30T10:30:00Z",
    "isPublic": false
  }
}
```

#### 2.4.3 덱 목록 조회

```
GET /decks
Authorization: Required
Query Parameters:
  - userId: uuid (optional, if querying other user's public decks)
  - page: integer (default: 1)
  - limit: integer (default: 20)

Response (200 OK):
{
  "status": "success",
  "data": {
    "decks": [
      {
        "deckId": "uuid",
        "name": "My First Deck",
        "cardCount": 45,
        "createdAt": "2025-11-30T10:30:00Z",
        "isPublic": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

#### 2.4.4 덱 수정

```
PATCH /decks/{deckId}
Authorization: Required
Content-Type: application/json

Request Body:
{
  "name": "Updated Deck Name",
  "description": "Updated description",
  "cards": [...]
}

Response (200 OK):
{
  "status": "success",
  "data": {
    "deckId": "uuid",
    "name": "Updated Deck Name",
    "updatedAt": "2025-11-30T10:35:00Z"
  }
}
```

#### 2.4.5 덱 삭제

```
DELETE /decks/{deckId}
Authorization: Required

Response (204 No Content):
```

---

### 2.5 게임/매칭 (Matchmaking)

#### 2.5.1 매칭 대기열 진입

```
POST /matchmaking/join
Authorization: Required
Content-Type: application/json

Request Body:
{
  "deckId": "uuid",
  "gameMode": "CASUAL|RANKED",
  "minRating": 0 (optional, for RANKED)
}

Response (202 Accepted):
{
  "status": "success",
  "data": {
    "queueId": "uuid",
    "position": 5,
    "estimatedWaitTime": 15,
    "gameMode": "CASUAL"
  }
}
```

#### 2.5.2 매칭 대기열 취소

```
DELETE /matchmaking/queue/{queueId}
Authorization: Required

Response (200 OK):
{
  "status": "success",
  "data": {
    "message": "Removed from queue"
  }
}
```

---

## 3. WebSocket API 명세 (실시간 게임)

### 3.1 연결 설정

```
URL (Dev):      ws://localhost:3000/ws
URL (Prod):     wss://api.jkcard.dev/ws

Query Params:
  - token: jwt_token
  - gameId: uuid (for rejoin)

Connection Format:
ws://localhost:3000/ws?token=eyJhbGc...&gameId=game-uuid
```

### 3.2 WebSocket 메시지 포맷

```json
{
  "type": "MESSAGE_TYPE",
  "gameId": "uuid",
  "playerId": "uuid",
  "timestamp": 1699699200000,
  "payload": {...},
  "signature": "hash_for_integrity"
}
```

### 3.3 클라이언트 → 서버 이벤트

#### 3.3.1 게임 시작 요청

```json
{
  "type": "GAME_START",
  "gameId": "game-uuid",
  "playerId": "player-uuid",
  "deckId": "deck-uuid",
  "timestamp": 1699699200000
}

Server Response (Broadcast to both players):
{
  "type": "GAME_STARTED",
  "gameId": "game-uuid",
  "players": [
    {
      "playerId": "player1-uuid",
      "username": "Player1",
      "hp": 20,
      "cursedEnergy": 1
    },
    {
      "playerId": "player2-uuid",
      "username": "Player2",
      "hp": 20,
      "cursedEnergy": 1
    }
  ],
  "currentTurn": 0,
  "currentPlayer": "player1-uuid"
}
```

#### 3.3.2 카드 플레이

```json
{
  "type": "PLAY_CARD",
  "gameId": "game-uuid",
  "playerId": "player-uuid",
  "payload": {
    "cardId": "SET01-001",
    "sourceZone": "hand",
    "targetZone": "battlefield",
    "targetPosition": 0,
    "cost": 5
  },
  "timestamp": 1699699200000
}

Server Validation & Response:
{
  "type": "CARD_PLAYED",
  "gameId": "game-uuid",
  "playerId": "player-uuid",
  "payload": {
    "cardId": "SET01-001",
    "zone": "battlefield",
    "position": 0
  },
  "isValid": true,
  "timestamp": 1699699200000
}

Error Response:
{
  "type": "PLAY_CARD_INVALID",
  "gameId": "game-uuid",
  "reason": "insufficient_cursed_energy",
  "details": {
    "required": 5,
    "available": 3
  }
}
```

#### 3.3.3 공격

```json
{
  "type": "ATTACK",
  "gameId": "game-uuid",
  "playerId": "player-uuid",
  "payload": {
    "attackerCardId": "card-on-battlefield",
    "targetType": "PLAYER|CARD",
    "targetCardId": "opponent-card-id (optional)"
  }
}

Server Response:
{
  "type": "ATTACK_DECLARED",
  "gameId": "game-uuid",
  "payload": {
    "attackerCardId": "card-id",
    "targetType": "PLAYER",
    "damage": 3
  }
}

Opponent Can Now:
{
  "type": "BLOCK",
  "gameId": "game-uuid",
  "playerId": "opponent-uuid",
  "payload": {
    "defenderCardId": "opponent-card-id",
    "attackerCardId": "attacking-card-id"
  }
}

or

{
  "type": "TAKE_DAMAGE",
  "gameId": "game-uuid",
  "playerId": "opponent-uuid",
  "payload": {
    "damage": 3
  }
}
```

#### 3.3.4 턴 종료

```json
{
  "type": "END_TURN",
  "gameId": "game-uuid",
  "playerId": "player-uuid"
}

Server Response (Broadcast):
{
  "type": "TURN_ENDED",
  "gameId": "game-uuid",
  "previousPlayer": "player1-uuid",
  "currentPlayer": "player2-uuid",
  "newTurnNumber": 2
}
```

#### 3.3.5 포기/항복

```json
{
  "type": "SURRENDER",
  "gameId": "game-uuid",
  "playerId": "player-uuid"
}

Server Response (Broadcast):
{
  "type": "GAME_ENDED",
  "gameId": "game-uuid",
  "winnerId": "opponent-uuid",
  "winReason": "opponent_surrender",
  "endTime": "2025-11-30T10:45:00Z"
}
```

### 3.4 서버 → 클라이언트 이벤트 (Broadcast)

#### 3.4.1 게임 상태 업데이트

```json
{
  "type": "GAME_STATE_UPDATE",
  "gameId": "game-uuid",
  "timestamp": 1699699200000,
  "payload": {
    "players": [
      {
        "playerId": "player1-uuid",
        "hp": 15,
        "maxHp": 20,
        "cursedEnergy": 5,
        "maxCursedEnergy": 5,
        "handCount": 4,
        "deckCount": 32,
        "graveyardCount": 8,
        "battlefield": [
          {
            "cardId": "SET01-001",
            "nameKr": "유토 김",
            "type": "JUJUTSU_USER",
            "position": 0,
            "atk": 3,
            "hp": 4,
            "statusEffects": []
          }
        ]
      },
      {
        "playerId": "player2-uuid",
        "hp": 20,
        ...
      }
    ],
    "currentTurn": 1,
    "currentPhase": "MAIN_PHASE_A",
    "currentPlayer": "player1-uuid"
  }
}
```

#### 3.4.2 게임 종료

```json
{
  "type": "GAME_ENDED",
  "gameId": "game-uuid",
  "timestamp": 1699699200000,
  "payload": {
    "winnerId": "player1-uuid",
    "winnerUsername": "Player1",
    "winReason": "opponent_hp_zero|deck_empty|timeout|surrender",
    "durationSeconds": 480,
    "player1Stats": {
      "finalHp": 8,
      "cardsPlayed": 23,
      "damageDealt": 12
    },
    "player2Stats": {
      "finalHp": 0,
      "cardsPlayed": 20,
      "damageDealt": 12
    }
  }
}
```

#### 3.4.3 에러 이벤트

```json
{
  "type": "ERROR",
  "gameId": "game-uuid",
  "timestamp": 1699699200000,
  "payload": {
    "code": "INVALID_GAME_ACTION",
    "message": "You cannot play this card right now",
    "severity": "ERROR|WARNING|INFO"
  }
}
```

---

## 4. HTTP 상태 코드

| 코드 | 의미 | 사용 경우 |
|------|------|---------|
| **200** | OK | 성공한 GET/PATCH 요청 |
| **201** | Created | 리소스 생성 성공 (POST) |
| **202** | Accepted | 매칭 대기열 진입 |
| **204** | No Content | 성공한 DELETE 요청 |
| **400** | Bad Request | 잘못된 요청 형식 |
| **401** | Unauthorized | 인증 필요 또는 토큰 만료 |
| **403** | Forbidden | 권한 없음 (다른 사용자 리소스) |
| **404** | Not Found | 리소스 없음 |
| **409** | Conflict | 중복된 username/email |
| **422** | Unprocessable Entity | 유효성 검사 실패 |
| **429** | Too Many Requests | Rate limit 초과 |
| **500** | Internal Server Error | 서버 에러 |
| **503** | Service Unavailable | 서버 점검 중 |

---

## 5. 에러 응답 상세

### 5.1 표준 에러 포맷

```json
{
  "status": "error",
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {
      "field": "error reason",
      "timestamp": "2025-11-30T10:30:00Z"
    },
    "requestId": "uuid-v4"
  }
}
```

### 5.2 일반적인 에러 코드

```
INVALID_CREDENTIALS      - 로그인 실패
TOKEN_EXPIRED           - 토큰 만료
INVALID_DECK            - 덱 검증 실패
INSUFFICIENT_CE         - 저주력 부족
INVALID_GAME_ACTION     - 불가능한 게임 행동
CARD_NOT_FOUND          - 카드 없음
DECK_NOT_FOUND          - 덱 없음
GAME_NOT_FOUND          - 게임 없음
UNAUTHORIZED            - 권한 없음
RATE_LIMIT_EXCEEDED     - 속도 제한 초과
```

---

## 6. 요청/응답 예시

### 6.1 완전한 게임 플로우 예시

```
1. 회원가입
POST /auth/register
{
  "username": "player1",
  "email": "player1@example.com",
  "password": "SecurePass123!"
}

2. 로그인
POST /auth/login
{
  "email": "player1@example.com",
  "password": "SecurePass123!"
}
Response: accessToken, refreshToken

3. 카드 조회
GET /cards?type=JUJUTSU_USER&limit=20
Authorization: Bearer {accessToken}

4. 덱 생성
POST /decks
Authorization: Bearer {accessToken}
{
  "name": "My First Deck",
  "cards": [...]
}
Response: deckId

5. 매칭 시작
POST /matchmaking/join
Authorization: Bearer {accessToken}
{
  "deckId": "{deckId}",
  "gameMode": "CASUAL"
}
Response: queueId

6. WebSocket 연결
ws://localhost:3000/ws?token={accessToken}&gameId={gameId}

7. 게임 시작부터 끝까지 WebSocket으로 실시간 통신
```

---

## 7. 보안 고려사항

### 7.1 HTTPS/WSS 필수

```
모든 프로덕션 통신은 HTTPS/WSS 암호화 필수
Certificate: Let's Encrypt (자동 갱신)
HSTS enabled (HTTP Strict Transport Security)
```

### 7.2 CORS 정책

```
Allowed Origins (Prod):
- https://jkcard.dev
- https://www.jkcard.dev

Allowed Methods:
- GET, POST, PATCH, DELETE, OPTIONS

Allowed Headers:
- Content-Type
- Authorization
```

### 7.3 인증 검증

```
모든 게임 액션은 서버 검증 필수:
- 카드는 플레이어가 실제로 보유해야 함
- 덱은 규칙을 준수해야 함
- 게임 상태는 서버에서만 관리
```

---

## 8. Rate Limiting

```
일반 엔드포인트:     100 requests/minute
인증 엔드포인트:     10 requests/minute (로그인 방어)
WebSocket:          연결 당 1000 메시지/10초

초과 시 응답:
HTTP 429 Too Many Requests
Retry-After: 60
```

---

## 9. 테스트 가능한 API 엔드포인트

### 9.1 Postman Collection

```json
{
  "info": {
    "name": "Jujutsu Kaisen Card Battle API",
    "version": "1.0"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/auth/register",
            "body": {...}
          }
        }
      ]
    }
  ]
}
```

---

**다음 문서**: `TDD/04-backend-game-logic.md`
