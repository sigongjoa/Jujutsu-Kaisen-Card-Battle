# TDD 04: Detailed Database Schema & Migrations

**문서 분류**: TDD (Technical Design Document)
**작성자**: Database Engineering Team
**최종 업데이트**: 2025-11-30
**상태**: Production Ready

---

## 1. 데이터베이스 설정

### 1.1 기본 정보

```
DBMS:           PostgreSQL 14+
Encoding:       UTF-8
Timezone:       UTC
Connection:     Connection Pooling (PgBouncer)
Max Connections: 100
```

### 1.2 초기화 스크립트

```bash
# 데이터베이스 생성
createdb -U postgres jkcard_game -E UTF8 -T template0

# 확장 설치
psql -U postgres -d jkcard_game -c "CREATE EXTENSION IF NOT EXISTS uuid-ossp;"
psql -U postgres -d jkcard_game -c "CREATE EXTENSION IF NOT EXISTS pg_trgm;"

# 기본 스키마 생성
psql -U postgres -d jkcard_game -f migrations/001_initial_schema.sql
```

---

## 2. 전체 테이블 DDL

### 2.1 Users Table

```sql
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,

    -- Profile
    display_name VARCHAR(100),
    profile_image_url VARCHAR(500),
    bio TEXT,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_banned BOOLEAN DEFAULT FALSE,
    ban_reason TEXT,
    ban_until TIMESTAMP,

    -- Statistics
    total_games_played INT DEFAULT 0,
    total_wins INT DEFAULT 0,
    elo_rating INT DEFAULT 1200,
    win_rate DECIMAL(5, 2),

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,

    -- Constraints
    CONSTRAINT username_length CHECK (char_length(username) >= 3),
    CONSTRAINT email_valid CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),

    -- Indices
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_elo_rating (elo_rating DESC),
    INDEX idx_created_at (created_at)
);

-- Trigger: 자동 updated_at 갱신
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at_trigger
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

### 2.2 Card Sets Table

```sql
CREATE TABLE card_sets (
    set_code VARCHAR(10) PRIMARY KEY,
    name_en VARCHAR(100) NOT NULL,
    name_kr VARCHAR(100) NOT NULL,
    description TEXT,

    -- Release Information
    release_date DATE NOT NULL,
    total_cards INT NOT NULL,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_legal BOOLEAN DEFAULT TRUE,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_release_date (release_date),
    INDEX idx_is_legal (is_legal)
);

CREATE TRIGGER card_sets_updated_at_trigger
BEFORE UPDATE ON card_sets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

### 2.3 Cards Table (마스터)

```sql
CREATE TABLE cards (
    card_id VARCHAR(20) PRIMARY KEY,  -- SET01-001 형식
    set_code VARCHAR(10) NOT NULL,
    card_number INT NOT NULL,

    -- Names
    name_en VARCHAR(100) NOT NULL,
    name_kr VARCHAR(100) NOT NULL,

    -- Card Type & Classification
    card_type VARCHAR(50) NOT NULL,  -- JUJUTSU_USER, CURSED_TECHNIQUE, etc.
    sub_type VARCHAR(50),
    rarity VARCHAR(20) NOT NULL,  -- COMMON, UNCOMMON, RARE, ULTRA_RARE

    -- Cost & Stats
    cost_main INT NOT NULL CHECK (cost_main >= 0 AND cost_main <= 10),
    stats_atk INT,
    stats_hp INT,
    power_score DECIMAL(5, 2),

    -- Game Rules
    text_rules TEXT NOT NULL,
    flavor_text TEXT,
    keywords TEXT,  -- JSON array as TEXT

    -- Art & Design
    artist_name VARCHAR(100),
    artist_credit VARCHAR(100),
    illustration_url VARCHAR(500),

    -- Metadata
    is_legal BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    UNIQUE(set_code, card_number),
    FOREIGN KEY (set_code) REFERENCES card_sets(set_code) ON DELETE RESTRICT,

    -- Indices
    INDEX idx_set_code (set_code),
    INDEX idx_card_type (card_type),
    INDEX idx_rarity (rarity),
    INDEX idx_cost (cost_main),
    INDEX idx_power_score (power_score),
    INDEX idx_search_name (name_kr, name_en) USING GIN,  -- Full-text search
    INDEX idx_is_legal (is_legal)
);

CREATE TRIGGER cards_updated_at_trigger
BEFORE UPDATE ON cards
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

### 2.4 User Collections Table

```sql
CREATE TABLE user_collections (
    collection_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    card_id VARCHAR(20) NOT NULL,

    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),

    acquired_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, card_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (card_id) REFERENCES cards(card_id) ON DELETE CASCADE,

    INDEX idx_user_id (user_id),
    INDEX idx_card_id (card_id),
    INDEX idx_user_card (user_id, card_id)
);

CREATE TRIGGER user_collections_updated_at_trigger
BEFORE UPDATE ON user_collections
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

### 2.5 Decks Table

```sql
CREATE TABLE decks (
    deck_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,

    name VARCHAR(100) NOT NULL,
    description TEXT,
    primary_color VARCHAR(20),

    -- Deck Info
    card_count INT CHECK (card_count >= 40 AND card_count <= 60),
    mana_curve_avg DECIMAL(5, 2),

    -- Status
    is_public BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,

    INDEX idx_user_id (user_id),
    INDEX idx_is_public (is_public),
    INDEX idx_created_at (created_at)
);

CREATE TRIGGER decks_updated_at_trigger
BEFORE UPDATE ON decks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

### 2.6 Deck Cards Table

```sql
CREATE TABLE deck_cards (
    deck_card_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deck_id UUID NOT NULL,
    card_id VARCHAR(20) NOT NULL,

    quantity INT NOT NULL CHECK (quantity >= 1 AND quantity <= 3),

    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(deck_id, card_id),
    FOREIGN KEY (deck_id) REFERENCES decks(deck_id) ON DELETE CASCADE,
    FOREIGN KEY (card_id) REFERENCES cards(card_id) ON DELETE CASCADE,

    INDEX idx_deck_id (deck_id)
);
```

### 2.7 Games Table

```sql
CREATE TABLE games (
    game_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id VARCHAR(50) NOT NULL UNIQUE,

    -- Players
    player1_id UUID NOT NULL,
    player2_id UUID NOT NULL,

    -- Deck Selection
    player1_deck_id UUID NOT NULL,
    player2_deck_id UUID NOT NULL,

    -- Game State
    status VARCHAR(20) DEFAULT 'WAITING',  -- WAITING, ACTIVE, ENDED
    current_turn INT DEFAULT 0,
    current_phase VARCHAR(20),  -- DRAW, MAIN_A, BATTLE, MAIN_B, END

    -- Results
    winner_id UUID,
    end_reason VARCHAR(50),  -- HP_ZERO, DECK_EMPTY, SURRENDER, TIMEOUT, etc.
    duration_seconds INT,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    ended_at TIMESTAMP,

    FOREIGN KEY (player1_id) REFERENCES users(user_id),
    FOREIGN KEY (player2_id) REFERENCES users(user_id),
    FOREIGN KEY (winner_id) REFERENCES users(user_id),
    FOREIGN KEY (player1_deck_id) REFERENCES decks(deck_id),
    FOREIGN KEY (player2_deck_id) REFERENCES decks(deck_id),

    INDEX idx_status (status),
    INDEX idx_ended_at (ended_at),
    INDEX idx_player1 (player1_id),
    INDEX idx_player2 (player2_id)
);
```

### 2.8 Game States Table (타임스탠프 히스토리)

```sql
CREATE TABLE game_states (
    game_state_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL,
    turn_number INT NOT NULL,

    -- Player 1 State
    p1_hp INT NOT NULL,
    p1_max_hp INT NOT NULL,
    p1_cursed_energy INT NOT NULL,
    p1_max_cursed_energy INT NOT NULL,
    p1_hand_count INT NOT NULL,
    p1_deck_count INT NOT NULL,
    p1_graveyard_count INT NOT NULL,
    p1_battlefield JSONB NOT NULL,  -- Array of cards

    -- Player 2 State
    p2_hp INT NOT NULL,
    p2_max_hp INT NOT NULL,
    p2_cursed_energy INT NOT NULL,
    p2_max_cursed_energy INT NOT NULL,
    p2_hand_count INT NOT NULL,
    p2_deck_count INT NOT NULL,
    p2_graveyard_count INT NOT NULL,
    p2_battlefield JSONB NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE,

    INDEX idx_game_id (game_id),
    INDEX idx_game_turn (game_id, turn_number)
);
```

### 2.9 Game Actions Table (로그)

```sql
CREATE TABLE game_actions (
    action_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL,
    turn_number INT NOT NULL,
    player_id UUID NOT NULL,

    action_type VARCHAR(50) NOT NULL,  -- PLAY_CARD, ATTACK, BLOCK, etc.
    action_data JSONB NOT NULL,

    is_valid BOOLEAN DEFAULT TRUE,
    validation_error TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES users(user_id),

    INDEX idx_game_id (game_id),
    INDEX idx_action_type (action_type),
    INDEX idx_created_at (created_at)
);
```

### 2.10 Leaderboard View

```sql
CREATE MATERIALIZED VIEW leaderboard AS
SELECT
    user_id,
    username,
    elo_rating,
    total_games_played,
    total_wins,
    win_rate,
    ROW_NUMBER() OVER (ORDER BY elo_rating DESC) as rank,
    created_at
FROM users
WHERE is_active = TRUE AND is_banned = FALSE
ORDER BY elo_rating DESC;

-- Index on view
CREATE INDEX idx_leaderboard_rank ON leaderboard(rank);

-- Refresh schedule (매시간 갱신)
-- REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard;
```

---

## 3. 마이그레이션 스크립트

### 3.1 Migration: 001_initial_schema.sql

```sql
-- 버전: 1.0
-- 작성일: 2025-11-30
-- 설명: 초기 스키마 생성

BEGIN;

-- 1. Users 테이블
CREATE TABLE users (
    -- ... (위의 전체 DDL)
);

-- 2. Card Sets 테이블
CREATE TABLE card_sets (
    -- ... (위의 전체 DDL)
);

-- 3. Cards 테이블
CREATE TABLE cards (
    -- ... (위의 전체 DDL)
);

-- 4. 나머지 테이블들...
-- user_collections, decks, deck_cards, games, game_states, game_actions

-- 5. Materialized View
CREATE MATERIALIZED VIEW leaderboard AS ...;

-- 6. Stored Procedures
CREATE OR REPLACE FUNCTION update_user_stats_on_game_end(
    p_winner_id UUID,
    p_loser_id UUID,
    p_winner_elo_change INT
) RETURNS void AS $$
BEGIN
    -- Winner 업데이트
    UPDATE users
    SET
        total_games_played = total_games_played + 1,
        total_wins = total_wins + 1,
        elo_rating = elo_rating + p_winner_elo_change,
        win_rate = ROUND(
            (total_wins + 1)::DECIMAL / (total_games_played + 1) * 100, 2
        ),
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = p_winner_id;

    -- Loser 업데이트
    UPDATE users
    SET
        total_games_played = total_games_played + 1,
        elo_rating = GREATEST(elo_rating - p_winner_elo_change, 0),
        win_rate = ROUND(
            total_wins::DECIMAL / (total_games_played + 1) * 100, 2
        ),
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = p_loser_id;
END;
$$ LANGUAGE plpgsql;

COMMIT;
```

### 3.2 Migration: 002_add_indexes_and_constraints.sql

```sql
-- 버전: 1.1
-- 작성일: 2025-12-01
-- 설명: 성능 최적화를 위한 인덱스 추가

BEGIN;

-- Full-text search index
CREATE INDEX idx_cards_search ON cards
USING gin(to_tsvector('korean', name_kr) || to_tsvector('english', name_en));

-- Composite indices
CREATE INDEX idx_games_players ON games(player1_id, player2_id);
CREATE INDEX idx_game_actions_log ON game_actions(game_id, created_at);

-- Partial indices (조건부 인덱스)
CREATE INDEX idx_active_users ON users(created_at)
WHERE is_active = TRUE AND is_banned = FALSE;

CREATE INDEX idx_legal_cards ON cards(card_type, cost_main)
WHERE is_legal = TRUE;

COMMIT;
```

### 3.3 마이그레이션 실행 스크립트

```bash
#!/bin/bash
# migrate.sh

DB_NAME="jkcard_game"
DB_USER="jkcard_user"
MIGRATION_DIR="./migrations"

# 마이그레이션 테이블 생성 (처음 한 번만)
psql -U $DB_USER -d $DB_NAME -c "
CREATE TABLE IF NOT EXISTS schema_version (
    version INT PRIMARY KEY,
    description VARCHAR(255),
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);"

# 최신 마이그레이션 버전 확인
LATEST_VERSION=$(psql -U $DB_USER -d $DB_NAME -t -c "SELECT MAX(version) FROM schema_version;")

# 모든 마이그레이션 실행
for migration in $(ls $MIGRATION_DIR/*.sql | sort); do
    VERSION=$(basename $migration | cut -d_ -f1)

    if [ $VERSION -gt $LATEST_VERSION ]; then
        echo "Running migration: $migration"
        psql -U $DB_USER -d $DB_NAME -f $migration

        if [ $? -eq 0 ]; then
            psql -U $DB_USER -d $DB_NAME -c "
            INSERT INTO schema_version (version, description)
            VALUES ($VERSION, '$(basename $migration)');"
            echo "Migration $VERSION completed successfully"
        else
            echo "Migration $VERSION failed!"
            exit 1
        fi
    fi
done

echo "All migrations completed"
```

---

## 4. 쿼리 예시 및 최적화

### 4.1 사용자의 카드 컬렉션 조회

```sql
-- ❌ 비효율적
SELECT * FROM user_collections uc
WHERE uc.user_id = '550e8400-e29b-41d4-a716-446655440000'
ORDER BY uc.acquired_date DESC;

-- ✅ 효율적 (JOIN + 인덱스 활용)
SELECT
    uc.collection_id,
    c.card_id,
    c.name_kr,
    c.cost_main,
    c.rarity,
    uc.quantity,
    uc.acquired_date
FROM user_collections uc
INNER JOIN cards c ON uc.card_id = c.card_id
WHERE uc.user_id = '550e8400-e29b-41d4-a716-446655440000'
  AND c.is_legal = TRUE
ORDER BY uc.acquired_date DESC
LIMIT 50;
```

### 4.2 유저의 모든 덱 및 카드 조회

```sql
SELECT
    d.deck_id,
    d.name,
    d.card_count,
    COUNT(DISTINCT dc.card_id) as unique_cards,
    AVG(c.cost_main) as avg_cost
FROM decks d
LEFT JOIN deck_cards dc ON d.deck_id = dc.deck_id
LEFT JOIN cards c ON dc.card_id = c.card_id
WHERE d.user_id = '550e8400-e29b-41d4-a716-446655440000'
  AND d.is_archived = FALSE
GROUP BY d.deck_id, d.name, d.card_count
ORDER BY d.created_at DESC;
```

### 4.3 게임 상태 저장

```sql
INSERT INTO game_states (
    game_id, turn_number,
    p1_hp, p1_max_hp, p1_cursed_energy, p1_max_cursed_energy,
    p1_hand_count, p1_deck_count, p1_graveyard_count, p1_battlefield,
    p2_hp, p2_max_hp, p2_cursed_energy, p2_max_cursed_energy,
    p2_hand_count, p2_deck_count, p2_graveyard_count, p2_battlefield
) VALUES (
    'game-uuid', 1,
    20, 20, 1, 1, 5, 54, 0, '[]'::jsonb,
    20, 20, 1, 1, 5, 54, 0, '[]'::jsonb
)
ON CONFLICT DO NOTHING;
```

---

## 5. 데이터 유지보수

### 5.1 정기적 정리 작업

```sql
-- 오래된 게임 상태 아카이브 (1개월 이상)
DELETE FROM game_states
WHERE game_id IN (
    SELECT game_id FROM games
    WHERE ended_at < CURRENT_DATE - INTERVAL '30 days'
);

-- 불활성 사용자 정리 (1년 미로그인)
UPDATE users
SET is_banned = TRUE, ban_reason = 'inactive'
WHERE last_login < CURRENT_DATE - INTERVAL '365 days'
  AND is_banned = FALSE;

-- 인덱스 재구성
REINDEX INDEX CONCURRENTLY idx_cards_search;
```

### 5.2 통계 갱신

```sql
-- 리더보드 갱신
REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard;

-- 승률 재계산
UPDATE users
SET win_rate = ROUND(
    total_wins::DECIMAL / NULLIF(total_games_played, 0) * 100, 2
)
WHERE total_games_played > 0;
```

---

## 6. 백업 및 복구

### 6.1 전체 데이터베이스 백업

```bash
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="jkcard_game_${TIMESTAMP}.sql"

pg_dump -U jkcard_user -d jkcard_game \
    --format=plain \
    --compress=9 \
    --file="${BACKUP_FILE}.gz"

# S3에 업로드
aws s3 cp "${BACKUP_FILE}.gz" s3://jkcard-backups/

# 로컬 백업 정리 (30일 이상된 파일 삭제)
find . -name "jkcard_game_*.sql.gz" -mtime +30 -delete
```

### 6.2 복구

```bash
#!/bin/bash
BACKUP_FILE="jkcard_game_20251130_100000.sql.gz"

# 기존 데이터베이스 삭제 (주의!)
dropdb -U postgres jkcard_game

# 새 데이터베이스 생성
createdb -U postgres jkcard_game

# 복구
gunzip -c "${BACKUP_FILE}" | psql -U jkcard_user -d jkcard_game
```

---

## 7. 모니터링 쿼리

### 7.1 데이터베이스 크기

```sql
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### 7.2 인덱스 사용 통계

```sql
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

### 7.3 느린 쿼리 감지

```sql
SELECT
    query,
    calls,
    mean_time,
    total_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

---

**다음 문서**: `TDD/05-frontend-architecture.md`
