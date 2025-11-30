# TDD 02: Data Schema & Database Design

**문서 분류**: TDD (Technical Design Document)
**작성자**: Database & Backend Team
**최종 업데이트**: 2025-11-30
**상태**: Draft

---

## 1. 데이터 스키마 개요

### 1.1 데이터 정규화 원칙

이 프로젝트는 **3정규형(3NF)** 이상의 정규화를 준수하여 데이터 무결성을 보장합니다.

```
┌─────────────────────────────────┐
│   Normalization Levels          │
├─────────────────────────────────┤
│ ✓ 1NF: 원자성                   │
│ ✓ 2NF: 부분 함수 종속 제거       │
│ ✓ 3NF: 이행적 함수 종속 제거    │
│ ✓ BCNF: 보이스-코드 정규형      │
└─────────────────────────────────┘
```

---

## 2. 핵심 데이터 엔티티 (Entities)

### 2.1 Users (사용자) 테이블

```sql
CREATE TABLE users (
    user_id UUID PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    profile_image_url VARCHAR(500),
    bio TEXT,

    -- Indices
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_created_at (created_at)
);
```

| 컬럼 | 타입 | 설명 | 제약 |
|------|------|------|------|
| `user_id` | UUID | 사용자 고유 식별자 | PK, Auto-generated |
| `username` | VARCHAR(50) | 플레이어 닉네임 | UNIQUE, NOT NULL |
| `email` | VARCHAR(255) | 이메일 주소 | UNIQUE, NOT NULL |
| `password_hash` | VARCHAR(255) | 해시된 비밀번호 | Bcrypt 사용 |
| `is_active` | BOOLEAN | 계정 활성 상태 | Default: TRUE |

### 2.2 Cards (카드) 마스터 테이블

```sql
CREATE TABLE cards (
    card_id VARCHAR(20) PRIMARY KEY,  -- e.g., "SET01-001"
    name_en VARCHAR(100) NOT NULL,
    name_kr VARCHAR(100) NOT NULL,
    card_type ENUM('JUJUTSU_USER', 'CURSED_TECHNIQUE',
                   'CURSED_OBJECT', 'EVENT', 'RESPONSE') NOT NULL,
    sub_type VARCHAR(50),  -- e.g., "1st-Grade", "Equipment"
    rarity ENUM('COMMON', 'UNCOMMON', 'RARE', 'ULTRA_RARE') NOT NULL,
    cost_main INT NOT NULL CHECK (cost_main >= 0 AND cost_main <= 10),

    -- Stats (for JUJUTSU_USER only)
    stats_atk INT,
    stats_hp INT,

    -- Game Rules Text
    text_rules TEXT NOT NULL,
    flavor_text TEXT,

    -- Art & Design
    artist_credit VARCHAR(100),
    illustration_url VARCHAR(500),

    -- Metadata
    set_code VARCHAR(10) NOT NULL,
    card_number INT NOT NULL,
    release_date DATE,
    is_legal BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Indices & Keys
    UNIQUE(set_code, card_number),
    INDEX idx_card_type (card_type),
    INDEX idx_rarity (rarity),
    INDEX idx_cost (cost_main),
    FOREIGN KEY (set_code) REFERENCES card_sets(set_code)
);
```

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `card_id` | VARCHAR(20) | 고유 카드 ID (예: SET01-001) |
| `card_type` | ENUM | 카드 타입 5가지 |
| `cost_main` | INT | 소환 비용 (0~10) |
| `stats_atk / stats_hp` | INT | 공격력/체력 (저주술사만) |
| `text_rules` | TEXT | 카드 효과 텍스트 |
| `is_legal` | BOOLEAN | 토너먼트 사용 가능 여부 |

### 2.3 CardSets (카드 세트) 테이블

```sql
CREATE TABLE card_sets (
    set_code VARCHAR(10) PRIMARY KEY,  -- e.g., "SET01"
    name_en VARCHAR(100) NOT NULL,
    name_kr VARCHAR(100) NOT NULL,
    description TEXT,
    release_date DATE NOT NULL,
    total_cards INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2.4 UserCollections (사용자 카드 컬렉션)

```sql
CREATE TABLE user_collections (
    collection_id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    card_id VARCHAR(20) NOT NULL,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    acquired_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, card_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (card_id) REFERENCES cards(card_id),
    INDEX idx_user_id (user_id),
    INDEX idx_card_id (card_id)
);
```

### 2.5 Decks (덱) 테이블

```sql
CREATE TABLE decks (
    deck_id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    primary_color VARCHAR(20),  -- 주 색상/세력

    -- Deck Stats
    card_count INT NOT NULL CHECK (card_count >= 40 AND card_count <= 60),
    mana_curve_avg FLOAT,

    -- Metadata
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
);
```

### 2.6 DeckCards (덱 내 카드) 테이블

```sql
CREATE TABLE deck_cards (
    deck_card_id UUID PRIMARY KEY,
    deck_id UUID NOT NULL,
    card_id VARCHAR(20) NOT NULL,
    quantity INT NOT NULL CHECK (quantity >= 1 AND quantity <= 3),

    UNIQUE(deck_id, card_id),
    FOREIGN KEY (deck_id) REFERENCES decks(deck_id) ON DELETE CASCADE,
    FOREIGN KEY (card_id) REFERENCES cards(card_id),
    INDEX idx_deck_id (deck_id)
);
```

### 2.7 Games (게임 세션) 테이블

```sql
CREATE TABLE games (
    game_id UUID PRIMARY KEY,
    room_id VARCHAR(50) NOT NULL,
    player1_id UUID NOT NULL,
    player2_id UUID NOT NULL,

    -- Game State
    status ENUM('WAITING', 'ACTIVE', 'ENDED') NOT NULL,
    current_turn INT DEFAULT 1,
    current_phase VARCHAR(20),  -- e.g., "MAIN_PHASE_A"

    -- Game Results
    winner_id UUID,
    end_reason VARCHAR(50),  -- "PLAYER_HP_ZERO", "DECK_EMPTY", etc.
    duration_seconds INT,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    ended_at TIMESTAMP,

    FOREIGN KEY (player1_id) REFERENCES users(user_id),
    FOREIGN KEY (player2_id) REFERENCES users(user_id),
    FOREIGN KEY (winner_id) REFERENCES users(user_id),
    INDEX idx_status (status),
    INDEX idx_ended_at (ended_at)
);
```

### 2.8 GameStates (게임 상태 스냅샷) 테이블

```sql
CREATE TABLE game_states (
    game_state_id UUID PRIMARY KEY,
    game_id UUID NOT NULL,
    turn_number INT NOT NULL,

    -- Player 1 State
    p1_hp INT NOT NULL,
    p1_cursed_energy INT NOT NULL,
    p1_hand_count INT NOT NULL,
    p1_battlefield JSON NOT NULL,  -- Array of cards on field
    p1_graveyard_count INT NOT NULL,

    -- Player 2 State
    p2_hp INT NOT NULL,
    p2_cursed_energy INT NOT NULL,
    p2_hand_count INT NOT NULL,
    p2_battlefield JSON NOT NULL,
    p2_graveyard_count INT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE,
    INDEX idx_game_id (game_id),
    INDEX idx_turn_number (turn_number)
);
```

### 2.9 GameActions (게임 액션 로그) 테이블

```sql
CREATE TABLE game_actions (
    action_id UUID PRIMARY KEY,
    game_id UUID NOT NULL,
    turn_number INT NOT NULL,
    player_id UUID NOT NULL,

    action_type ENUM('PLAY_CARD', 'ATTACK', 'BLOCK', 'ACTIVATE_ABILITY',
                     'DRAW_CARD', 'PASS', 'SURRENDER'),
    action_data JSON NOT NULL,  -- Flexible action details

    -- Validation
    is_valid BOOLEAN DEFAULT TRUE,
    validation_error TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES users(user_id),
    INDEX idx_game_id (game_id),
    INDEX idx_action_type (action_type)
);
```

---

## 3. 데이터 관계 다이어그램 (ER Diagram)

```
┌──────────────────┐         ┌──────────────────┐
│     Users        │         │   CardSets       │
├──────────────────┤         ├──────────────────┤
│ PK: user_id      │         │ PK: set_code     │
│ username         │         │ name_kr          │
│ email            │◄────┐   │ release_date     │
│ password_hash    │     │   └──────────────────┘
└──────────────────┘     │
         │              │
         ├─────┬────────┤
         │     │        │
         │     │    ┌───────────────────┐
         │     │    │     Cards         │
         │     │    ├───────────────────┤
         │     └────│ PK: card_id       │
         │          │ FK: set_code ─────┘
         │          │ card_type
         │          │ cost_main
         │          │ stats_atk/hp
         │          │ text_rules
         │          └───────────────────┘
         │                  │
         │            ┌─────┴──────┐
         │            │            │
         │     ┌──────────────────────────┐
         │     │   UserCollections        │
         │     ├──────────────────────────┤
         │     │ FK: user_id              │
         │────├─│ FK: card_id              │
         │     │ quantity                 │
         │     └──────────────────────────┘
         │
         │     ┌──────────────────────────┐
         │     │      Decks               │
         │     ├──────────────────────────┤
         │────├─│ PK: deck_id              │
         │     │ FK: user_id              │
         │     │ card_count               │
         │     └──────────────────────────┘
         │              │
         │              │    ┌──────────────────────┐
         │              └───┤│   DeckCards          │
         │                   │├──────────────────────┤
         │                   ││ FK: deck_id          │
         │                   ││ FK: card_id          │
         │                   ││ quantity             │
         │                   │└──────────────────────┘
         │
         │     ┌──────────────────────────┐
         │     │       Games              │
         │     ├──────────────────────────┤
         │────├─│ PK: game_id              │
         │     │ FK: player1_id           │
         │     │ FK: player2_id           │
         │     │ FK: winner_id (nullable) │
         │     │ status                   │
         │     └──────────────────────────┘
         │              │
         │         ┌────┴────┐
         │         │         │
         │    ┌─────────────────────────┐
         │    │   GameStates            │
         │    ├─────────────────────────┤
         │────├─│ FK: game_id             │
         │    │ turn_number             │
         │    │ p1_hp, p2_hp            │
         │    │ p1_battlefield (JSON)   │
         │    └─────────────────────────┘
         │
         │    ┌─────────────────────────┐
         │    │   GameActions           │
         │    ├─────────────────────────┤
         │────├─│ FK: game_id             │
         │    │ FK: player_id           │
         │    │ action_type             │
         │    │ action_data (JSON)      │
         │    └─────────────────────────┘
```

---

## 4. 인덱싱 전략 (Indexing Strategy)

### 4.1 주요 인덱스

| 테이블 | 인덱스 | 사유 |
|--------|--------|------|
| **users** | idx_username, idx_email | 빠른 로그인/가입 |
| **cards** | idx_card_type, idx_rarity, idx_cost | 카드 검색 성능 |
| **user_collections** | idx_user_id, idx_card_id | 컬렉션 조회 |
| **games** | idx_status, idx_ended_at | 게임 리스트 조회 |
| **game_actions** | idx_game_id, idx_action_type | 게임 로그 분석 |

### 4.2 복합 인덱스 (Composite Indices)

```sql
-- 사용자의 덱 빠른 조회
CREATE INDEX idx_user_decks ON decks(user_id, created_at);

-- 게임 결과 통계
CREATE INDEX idx_game_results ON games(winner_id, ended_at);

-- 카드 검색
CREATE INDEX idx_card_search ON cards(set_code, card_type, cost_main);
```

---

## 5. 데이터 타입 선정 근거

### 5.1 UUID vs AUTO INCREMENT

**선택**: UUID (UUID v4)

```
이유:
1. 분산 시스템에 적합
2. 보안 (ID 예측 어려움)
3. 데이터베이스 간 병합 용이
4. 마이크로서비스 환경에서 우수

성능 트레이드오프:
- 저장 공간 16 bytes (vs INT 4 bytes)
- 인덱스 크기 증가
- 조회 약간 느림 (수용 가능 수준)
```

### 5.2 JSON 필드 사용

**사용처**: `battlefield`, `action_data`

```
이유:
1. 유연한 데이터 구조
2. 게임 상태의 복잡성 관리
3. 향후 기능 추가 용이

JSON 구조 예시:
{
  "cards": [
    {
      "card_id": "SET01-001",
      "name": "Yuto Kim",
      "atk": 3,
      "hp": 4,
      "position": 0,
      "status_effects": ["weakened"]
    }
  ]
}
```

---

## 6. 데이터 암호화 & 보안

### 6.1 민감 데이터 암호화

| 데이터 | 암호화 방식 | 저장 방식 |
|--------|-----------|---------|
| **비밀번호** | Bcrypt | Hash only |
| **이메일** | At-rest encryption | AES-256 |
| **JWT 토큰** | HS256/RS256 | In-memory |
| **게임 상태** | None (내부용) | Plaintext |

### 6.2 접근 제어 (Access Control)

```sql
-- 사용자는 자신의 데이터만 조회
SELECT * FROM user_collections
WHERE user_id = :authenticated_user_id;

-- 공개 덱 만 다른 사용자에게 조회 가능
SELECT * FROM decks
WHERE user_id = :target_user_id AND is_public = TRUE;
```

---

## 7. 쿼리 성능 최적화 예시

### 7.1 느린 쿼리 예시 (Anti-pattern)

```sql
-- ❌ 비효율적
SELECT * FROM games g
WHERE EXISTS (
  SELECT 1 FROM game_actions ga
  WHERE ga.game_id = g.game_id
)
AND g.ended_at > DATE_SUB(NOW(), INTERVAL 7 DAY);
```

### 7.2 최적화된 쿼리

```sql
-- ✓ 효율적
SELECT g.game_id, g.winner_id, g.duration_seconds
FROM games g
WHERE g.ended_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
  AND g.status = 'ENDED'
ORDER BY g.ended_at DESC
LIMIT 100;
```

---

## 8. 데이터 마이그레이션 (Data Migration)

### 8.1 버전 관리

```
schema_version: 1.0
├─ Initial schema with core tables
├─ Added user_collections
└─ Added tournament_rankings

schema_version: 1.1
├─ Added game_state_history
├─ Expanded card_sets
└─ Added leaderboard views
```

### 8.2 마이그레이션 스크립트 예시

```sql
-- v1.1 Migration: Add game_state_history
BEGIN TRANSACTION;

ALTER TABLE games ADD COLUMN state_history_id UUID;

CREATE TABLE game_state_history (
    history_id UUID PRIMARY KEY,
    game_id UUID NOT NULL,
    states JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games(game_id)
);

COMMIT;
```

---

## 9. 백업 & 복구 전략

### 9.1 백업 계획

```
Daily Backups (매일)
├─ Full backup (자정)
└─ Incremental backup (6시간마다)

Weekly Backups (주단위)
└─ Full backup (일요일 자정)

Monthly Backups (월단위)
└─ Long-term archive (매월 1일)
```

### 9.2 복구 시간 목표 (RTO/RPO)

| 지표 | 목표 |
|------|------|
| **RTO** (Recovery Time Objective) | 1시간 |
| **RPO** (Recovery Point Objective) | 15분 |

---

## 10. 모니터링 & 유지보수

### 10.1 모니터링 항목

```
┌─────────────────────────────────┐
│ Database Health Monitoring       │
├─────────────────────────────────┤
│ • Query performance (slow log)   │
│ • Table size growth             │
│ • Index usage statistics        │
│ • Connection pool utilization   │
│ • Replication lag (if applicable)
│ • Disk space usage              │
└─────────────────────────────────┘
```

### 10.2 유지보수 작업

| 작업 | 빈도 | 목적 |
|------|------|------|
| **VACUUM** | 주 1회 | 데드 스페이스 정리 |
| **ANALYZE** | 주 1회 | 통계 업데이트 |
| **인덱스 재구성** | 월 1회 | 성능 최적화 |
| **테이블 정렬** | 분기별 | 조각화 해소 |

---

## 11. 관련 문서

- `TDD/01-architecture-overview.md` - 시스템 아키텍처
- `TDD/06-database-design.md` - 데이터베이스 상세 설계
- `DESIGN/master-data-spec.md` - 마스터 데이터 명세

---

**작성자**: Database Architect
**최종 검토**: 2025-11-30
**버전**: 1.0 (Draft)
