# TDD 01: Architecture Overview

**문서 분류**: TDD (Technical Design Document)
**작성자**: Engineering Team
**최종 업데이트**: 2025-11-30
**상태**: Draft

---

## 1. 시스템 아키텍처 개요

### 1.1 전체 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────────┐
│                   Jujutsu Kaisen Card Battle            │
│                    System Architecture                   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────┐         ┌──────────────────────┐
│   Client Layer          │         │  Server Layer        │
│  (웹/모바일 앱)          │◄────────►│  (게임 로직)          │
│                         │         │                      │
│ • React/Vue.js          │         │ • Node.js / Python   │
│ • WebSocket Client      │         │ • Game Engine        │
│ • Local Cache           │         │ • Room Manager       │
│ • UI State              │         │ • Matchmaking        │
└─────────────────────────┘         └──────────────────────┘
          │                                    │
          │                                    │
          └────────┬─────────────────────────┘
                   │
        ┌──────────▼──────────┐
        │   Database Layer    │
        │                     │
        │ • User Account      │
        │ • Card Collection   │
        │ • Game History      │
        │ • Match Data        │
        │                     │
        │ PostgreSQL/MongoDB  │
        └─────────────────────┘
```

### 1.2 핵심 아키텍처 원칙

| 원칙 | 설명 |
|------|------|
| **Server-Authoritative** | 모든 게임 상태는 서버에서 검증 |
| **Stateless Clients** | 클라이언트는 UI만 담당, 상태 저장 X |
| **Real-time Communication** | WebSocket으로 낮은 지연시간 실현 |
| **Scalability** | 마이크로서비스 아키텍처로 확장성 확보 |
| **Security First** | 부정행위 방지 및 데이터 보호 우선 |

---

## 2. 기술 스택 (Tech Stack)

### 2.1 백엔드 (Server-Side)

```
┌─────────────────────────────────────────┐
│       Backend Architecture              │
├─────────────────────────────────────────┤
│                                         │
│ Language: Python 3.11 / Node.js 18+     │
│                                         │
│ Framework:                              │
│  • FastAPI (Python) 또는 Express.js     │
│  • Game Logic Engine (Custom)           │
│                                         │
│ Database:                               │
│  • PostgreSQL (관계형 데이터)           │
│  • Redis (실시간 캐시/세션)             │
│                                         │
│ Real-time:                              │
│  • WebSocket (Socket.io / ws)           │
│  • Message Queue (RabbitMQ / Redis)     │
│                                         │
│ Deployment:                             │
│  • Docker / Kubernetes                  │
│  • Cloud: AWS / GCP / Azure             │
│                                         │
└─────────────────────────────────────────┘
```

### 2.2 프론트엔드 (Client-Side)

```
┌─────────────────────────────────────────┐
│       Frontend Architecture             │
├─────────────────────────────────────────┤
│                                         │
│ Framework: React 18+ / Vue 3+           │
│                                         │
│ State Management:                       │
│  • Redux / Vuex (주요 게임 상태)       │
│  • Context API (UI 상태)                │
│                                         │
│ Real-time:                              │
│  • WebSocket Client (Socket.io)         │
│  • Event Bus (Pub/Sub 패턴)            │
│                                         │
│ Storage:                                │
│  • LocalStorage (세션 캐시)             │
│  • IndexedDB (카드 이미지 등)           │
│                                         │
│ Deployment:                             │
│  • Static Hosting (Netlify / Vercel)    │
│  • CDN (이미지 배포)                    │
│                                         │
└─────────────────────────────────────────┘
```

---

## 3. 시스템 구성 (System Components)

### 3.1 주요 마이크로서비스

```
┌────────────────────────────────────────────────┐
│        Microservices Architecture             │
├────────────────────────────────────────────────┤
│                                               │
│ ┌──────────────────┐                         │
│ │ Auth Service     │ - 로그인, 회원가입      │
│ │ (포트 3001)      │                         │
│ └──────────────────┘                         │
│                                               │
│ ┌──────────────────┐                         │
│ │ Card Service     │ - 카드 정보, 컬렉션    │
│ │ (포트 3002)      │                         │
│ └──────────────────┘                         │
│                                               │
│ ┌──────────────────┐                         │
│ │ Game Service     │ - 게임 로직, 규칙 적용│
│ │ (포트 3003)      │                         │
│ └──────────────────┘                         │
│                                               │
│ ┌──────────────────┐                         │
│ │ Match Service    │ - 매칭, 로비            │
│ │ (포트 3004)      │                         │
│ └──────────────────┘                         │
│                                               │
│ ┌──────────────────┐                         │
│ │ Rank Service     │ - 랭킹, 통계            │
│ │ (포트 3005)      │                         │
│ └──────────────────┘                         │
│                                               │
└────────────────────────────────────────────────┘
```

### 3.2 각 서비스의 책임

| 서비스 | 책임 | 저장소 |
|--------|------|--------|
| **Auth** | 사용자 인증, 토큰 관리 | User DB |
| **Card** | 카드 정보, 사용자 컬렉션 | Card DB |
| **Game** | 게임 로직, 상태 관리 | Redis (임시) |
| **Match** | 매칭, 로비, 게임 룸 | Redis + Lobby DB |
| **Rank** | 랭킹, ELO, 통계 | Rank DB |

---

## 4. 통신 프로토콜 (Communication Protocol)

### 4.1 클라이언트 ↔ 서버 통신

#### 4.1.1 REST API (초기 요청)

```
HTTP Method   Endpoint                  Purpose
─────────────────────────────────────────────────────
POST          /api/auth/login           사용자 로그인
POST          /api/auth/register        회원가입
GET           /api/cards                카드 정보 조회
GET           /api/collection           사용자 컬렉션
GET           /api/ranking              랭킹 조회
```

#### 4.1.2 WebSocket (실시간 게임)

```
Event Type     Direction    Purpose
───────────────────────────────────────────────
GAME_START     Server→Client  게임 시작 신호
PLAYER_ACTION  Client→Server  플레이어 행동
GAME_STATE     Server→Client  게임 상태 업데이트
CARD_PLAYED    Server→Client  카드 플레이 브로드캐스트
GAME_END       Server→Client  게임 종료
```

### 4.2 메시지 포맷

#### 4.2.1 WebSocket 메시지 구조

```json
{
  "type": "CARD_PLAYED",
  "gameId": "game_12345",
  "playerId": "player_456",
  "timestamp": 1699699200000,
  "payload": {
    "cardId": "card_789",
    "sourceZone": "hand",
    "targetZone": "battlefield",
    "cost": 3,
    "timestamp": 1699699200000
  },
  "signature": "hash_for_verification"
}
```

#### 4.2.2 게임 상태 업데이트 메시지

```json
{
  "type": "GAME_STATE_UPDATE",
  "gameId": "game_12345",
  "timestamp": 1699699200000,
  "players": [
    {
      "playerId": "player_456",
      "hp": 15,
      "maxHP": 20,
      "cursedEnergy": 5,
      "maxCursedEnergy": 7,
      "hand": {
        "count": 4
      },
      "battlefield": [
        {
          "cardId": "card_001",
          "name": "Yuto Kim",
          "type": "JUJUTSU_USER",
          "atk": 3,
          "hp": 4
        }
      ],
      "graveyard": {
        "count": 3
      }
    }
  ],
  "currentTurn": 0,
  "phase": "MAIN_PHASE_A"
}
```

---

## 5. 데이터 흐름 (Data Flow)

### 5.1 게임 시작부터 종료까지의 데이터 흐름

```
┌──────────┐
│ Client   │ (1) 게임 참여 요청 (matchmaking)
└──────────┘
    │
    │ HTTP POST /api/match/join
    │
    ▼
┌──────────────────────┐
│ Matchmaking Service  │ (2) 플레이어 대기열에 추가
└──────────────────────┘
    │
    │ (2~3초 후, 짝 찾음)
    │
    ▼
┌──────────────────────┐
│ Match Service        │ (3) 게임 룸 생성
└──────────────────────┘
    │
    │ (4) WebSocket 연결 요청
    │
    ▼
┌──────────────────────┐
│ Game Service         │ (5) 게임 상태 초기화
│                      │ (6) 초기 상태 브로드캐스트
└──────────────────────┘
    │
    │ (7) 플레이어의 카드 플레이 액션 수신
    │
    ▼
┌──────────────────────┐
│ Game Logic Engine    │ (8) 행동 검증 및 처리
│                      │ (9) 새로운 상태 계산
└──────────────────────┘
    │
    │ (10) 모든 클라이언트에 상태 브로드캐스트
    │
    ▼
┌──────────┐
│ Clients  │ (11) UI 업데이트
└──────────┘
    │
    │ (게임이 끝날 때까지 반복)
    │
    ▼
┌──────────────────────┐
│ Game Service         │ (12) 게임 종료, 결과 저장
└──────────────────────┘
    │
    │ (13) 랭킹, 통계 업데이트
    │
    ▼
┌──────────────────────┐
│ Rank Service         │ (14) ELO 계산, DB 저장
└──────────────────────┘
```

---

## 6. 보안 아키텍처 (Security Architecture)

### 6.1 보안 계층

```
┌────────────────────────────────────────┐
│  Client (Trust Boundary)               │
├────────────────────────────────────────┤
│                                        │
│  Input Validation                      │
│  (클라이언트 사이드 검증)              │
│                                        │
│         ↓ (HTTPS/WSS 암호화)           │
│                                        │
├────────────────────────────────────────┤
│  Server (Authority)                    │
├────────────────────────────────────────┤
│                                        │
│  Request Validation (재검증)           │
│  Game Logic Execution                  │
│  State Verification                    │
│  Output Encryption                     │
│                                        │
│         ↓                              │
│                                        │
│  Database (Encrypted Storage)          │
│                                        │
└────────────────────────────────────────┘
```

### 6.2 주요 보안 기능

| 기능 | 구현 방식 |
|------|---------|
| **인증** | JWT 토큰 + Refresh Token |
| **암호화** | HTTPS/TLS 1.3 통신 |
| **게임 상태 검증** | Server-Authoritative 모든 액션 검증 |
| **부정행위 감지** | 이상 행동 패턴 모니터링 (ML 기반) |
| **난수 생성** | Cryptographically Secure RNG |
| **감사 로그** | 모든 게임 액션 기록 |

---

## 7. 확장성 (Scalability)

### 7.1 수평 확장 (Horizontal Scaling)

```
Load Balancer
      │
      ├─→ Game Service Instance 1
      ├─→ Game Service Instance 2
      ├─→ Game Service Instance 3
      └─→ Game Service Instance N

특징:
• 동일한 게임 로직을 여러 인스턴스에서 실행
• 로드 밸런서가 요청을 분산
• 한 인스턴스 장애 시 다른 인스턴스가 대체
```

### 7.2 캐싱 전략 (Caching)

```
┌─────────────────────────────────────┐
│ L1 Cache: In-Memory (애플리케이션)  │
│ └─ 카드 정보, 규칙 데이터            │
│                                    │
├─────────────────────────────────────┤
│ L2 Cache: Redis (분산 캐시)         │
│ └─ 게임 상태, 사용자 세션            │
│                                    │
├─────────────────────────────────────┤
│ L3: Database (PostgreSQL)           │
│ └─ 영구 저장소                       │
│                                    │
└─────────────────────────────────────┘
```

---

## 8. 성능 고려사항 (Performance Considerations)

### 8.1 성능 목표

| 메트릭 | 목표값 |
|--------|-------|
| **게임 시작 시간** | < 2초 |
| **카드 플레이 지연시간** | < 200ms |
| **상태 업데이트 지연시간** | < 100ms |
| **매칭 대기시간** | < 10초 |
| **동시 접속자 지원** | 50,000+ |

### 8.2 최적화 전략

1. **네트워크 최적화**
   - 필수 데이터만 전송
   - 메시지 압축 (gzip)
   - 배치 업데이트 (여러 액션을 한 번에)

2. **데이터베이스 최적화**
   - 인덱싱 전략
   - 쿼리 최적화
   - 캐싱 활용

3. **게임 로직 최적화**
   - 비효율적 알고리즘 제거
   - 프로파일링 및 병목 지점 개선
   - 병렬 처리 활용

---

## 9. 모니터링 및 로깅 (Monitoring & Logging)

### 9.1 주요 모니터링 대상

```
┌─────────────────────────────────────────┐
│ Application Metrics                     │
├─────────────────────────────────────────┤
│ • Request latency                       │
│ • Error rate                            │
│ • Active game rooms                     │
│ • Player queue length                   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Infrastructure Metrics                  │
├─────────────────────────────────────────┤
│ • CPU usage                             │
│ • Memory usage                          │
│ • Disk I/O                              │
│ • Network bandwidth                     │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Business Metrics                        │
├─────────────────────────────────────────┤
│ • Active users                          │
│ • Matchmaking success rate              │
│ • Average session duration              │
│ • Player retention                      │
└─────────────────────────────────────────┘
```

### 9.2 로깅 레벨

| 레벨 | 용도 | 예시 |
|------|------|------|
| **DEBUG** | 개발 디버깅 | "Card played: CARD_001" |
| **INFO** | 주요 이벤트 | "Player joined game: game_123" |
| **WARN** | 경고 | "High latency detected: 500ms" |
| **ERROR** | 에러 | "Database connection failed" |
| **CRITICAL** | 심각한 에러 | "Server crash imminent" |

---

## 10. 배포 전략 (Deployment Strategy)

### 10.1 배포 파이프라인

```
Code Commit
    ↓
Automated Tests
    ↓
Build Docker Image
    ↓
Push to Registry
    ↓
Staging Deployment
    ↓
Smoke Tests
    ↓
Production Deployment
    ↓
Health Checks
    ↓
Monitoring
```

### 10.2 환경 구성

| 환경 | 용도 | 특징 |
|------|------|------|
| **Development** | 로컬 개발 | 단일 머신, 실시간 리로드 |
| **Staging** | 사전 검증 | 프로덕션과 동일한 설정 |
| **Production** | 실제 서비스 | 고가용성, 모니터링 활성화 |

---

## 11. 향후 고려사항

### 11.1 확장 계획

- **국제화**: 다국어 지원 추가
- **모바일 앱**: 네이티브 앱 개발
- **오프라인 지원**: 로컬 게임 모드
- **AI 플레이어**: NPC 상대 플레이

### 11.2 기술 스택 업그레이드

- 매년 주요 프레임워크 버전 업데이트
- 신기술 평가 및 도입 (GraphQL 등)
- 클라우드 인프라 최적화

---

## 12. 참고 자료

### 12.1 관련 문서

- `TDD/02-data-schema.md` - 데이터베이스 설계
- `TDD/03-game-logic.md` - 게임 로직 상세
- `TDD/04-server-design.md` - 서버 상세 설계
- `TDD/06-database-design.md` - DB 상세 설계

### 12.2 외부 참고

- [WebSocket Best Practices](https://tools.ietf.org/html/rfc6455)
- [Microservices Pattern](https://microservices.io/)
- [12-Factor App](https://12factor.net/)

---

**다음 문서**: `TDD/02-data-schema.md`
