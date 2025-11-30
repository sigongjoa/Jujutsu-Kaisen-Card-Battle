# TDD 07: Card System Architecture (카드 시스템 설계)

**문서 분류**: TDD (Technical Design Document)
**작성자**: Game Systems Architecture Team
**최종 업데이트**: 2025-11-30
**상태**: Production Ready

---

## 1. 카드 시스템 개요

### 1.1 카드는 게임의 핵심

```
게임 = 카드의 조합 + 규칙 엔진

카드 하나 =
  ├─ 데이터 구조 (ID, 능력, 비용 등)
  ├─ 게임 로직 (카드가 발동될 때의 동작)
  ├─ 상태 관리 (필드에서의 변화)
  └─ 비주얼 표현 (일러스트, 레이아웃)

200장의 카드 = 200 * (구조 + 로직 + 상태 + 비주얼)
```

### 1.2 카드 시스템의 복잡성

```
단순 구조 (❌ 우리가 피해야 할 것):
Card {
  id: string
  name: string
  cost: number
  effect: string  // "뭔가 한다"
}

→ 문제: "뭔가"를 어떻게 실행? 게임 엔진에 하드코딩? 매번 새로운 카드마다 코드 수정?

복잡한 구조 (❌ 과도할 것):
Card {
  id: string
  script: "javascript 코드"
}

→ 문제: 보안, 성능, 유지보수 불가능
```

---

## 2. 카드 데이터 구조 (TypeScript)

### 2.1 기본 카드 인터페이스

```typescript
// src/types/card.ts

/**
 * 카드의 기본 정보 (데이터베이스 저장)
 */
export interface CardData {
  // 식별자
  cardId: string;           // "SET01-001"
  setCode: string;          // "SET01"
  cardNumber: number;       // 1

  // 기본 정보
  nameKr: string;           // "유토 김"
  nameEn: string;           // "Yuto Kim"
  description: string;      // 카드 설명

  // 분류
  type: CardType;           // "JUJUTSU_USER" | "CURSED_TECHNIQUE" | ...
  subType?: string;         // "1st-Grade" | "Weapon" | ...
  rarity: Rarity;           // "COMMON" | "UNCOMMON" | "RARE" | "ULTRA_RARE"

  // 비용
  cost: number;             // 0-10

  // 스탯 (저주술사만)
  stats?: {
    atk: number;            // 공격력
    hp: number;             // 체력
  };

  // 효과 (매우 중요!)
  abilities: CardAbility[];

  // 키워드 (효율적 처리)
  keywords: Keyword[];

  // 추가 정보
  flavorText?: string;
  artistCredit?: string;
  illustrationUrl?: string;
  releaseDate: Date;
  isLegal: boolean;
}

/**
 * 카드 타입 정의
 */
export type CardType =
  | 'JUJUTSU_USER'        // 저주술사 (캐릭터)
  | 'CURSED_TECHNIQUE'    // 주술 (일회용 효과)
  | 'CURSED_OBJECT'       // 저주물 (지속 효과)
  | 'EVENT'               // 사건 (양쪽 영향)
  | 'RESPONSE';           // 반응 (대응 카드)

export type Rarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'ULTRA_RARE';

/**
 * 능력 정의 (카드의 효과)
 */
export interface CardAbility {
  abilityId: string;        // "ability_001"
  name: string;             // "비의 자"
  description: string;      // 설명
  type: AbilityType;        // 능력 타입
  triggerCondition: Trigger; // 발동 조건
  effect: EffectPayload;    // 실제 효과
  cost?: AbilityCost;       // 능력 사용 비용
  canActivatePerTurn?: number; // 턴당 발동 제한 (기본 1)
  priority?: number;        // 우선순위 (높을수록 먼저 처리)
}

/**
 * 능력 타입
 */
export type AbilityType =
  | 'PASSIVE'      // 자동 발동 (플레이 시)
  | 'TRIGGERED'    // 트리거 (조건 충족 시)
  | 'ACTIVATED';   // 활성화 (플레이어가 비용 지불해서 사용)

/**
 * 발동 조건
 */
export interface Trigger {
  event: TriggerEvent;      // 발동 이벤트
  condition?: {             // 추가 조건
    targetCount?: number;
    requiresTarget?: boolean;
    minHp?: number;
  };
}

export type TriggerEvent =
  | 'ON_PLAY'               // 카드 플레이 시
  | 'ON_ENTER_FIELD'        // 필드 진입 시
  | 'ON_ATTACK'             // 공격할 때
  | 'ON_BLOCK'              // 블록할 때
  | 'ON_DAMAGE_TAKEN'       // 손상 입을 때
  | 'ON_TURN_START'         // 턴 시작 시
  | 'ON_TURN_END'           // 턴 종료 시
  | 'ON_OPPONENT_PLAY';     // 상대가 카드 플레이할 때

/**
 * 효과 페이로드 (실제 게임 로직)
 */
export interface EffectPayload {
  effectType: EffectType;
  target: EffectTarget;     // 누가 영향을 받는가?
  value: number | string;   // 효과의 강도/내용
  metadata?: Record<string, any>;
}

export type EffectType =
  | 'DAMAGE'                // 손상 입히기
  | 'HEAL'                  // 회복
  | 'DRAW'                  // 카드 뽑기
  | 'SUMMON'                // 저주술사 소환
  | 'DESTROY'               // 카드 파괴
  | 'DISCARD'               // 손에서 버리기
  | 'MODIFY_STATS'          // 스탯 변경
  | 'STATUS_EFFECT'         // 상태 이상
  | 'STEAL'                 // 카드 빼앗기
  | 'SEARCH'                // 덱에서 찾기
  | 'BOUNCE'                // 손으로 돌리기
  | 'TRANSFORM'             // 변신/변환
  | 'CLONE'                 // 복제
  | 'SACRIFICE';            // 제물로 바치기

export interface EffectTarget {
  player: 'SELF' | 'OPPONENT' | 'BOTH';
  zone: 'HAND' | 'FIELD' | 'GRAVEYARD' | 'DECK';
  count: number;            // 몇 개를 대상으로?
  filter?: {                // 필터링 조건
    type?: CardType;
    rarity?: Rarity;
    cost?: { min: number; max: number };
    hasKeyword?: Keyword;
  };
}

/**
 * 능력 사용 비용
 */
export interface AbilityCost {
  cursedEnergy?: number;    // 저주력 비용
  hp?: number;              // 체력 비용
  discard?: number;         // 손패 버리기
}

/**
 * 키워드 (효율적 처리)
 */
export type Keyword =
  | 'PIERCING'              // 관통
  | 'EVASION'               // 회피
  | 'INDESTRUCTIBLE'        // 불굴
  | 'LIFELINK'              // 생명력 흡수
  | 'HASTE'                 // 즉시 공격
  | 'VIGILANCE'             // 경계
  | 'FLYING'                // 비행
  | 'STEALTH'               // 은신
  | 'VENGEANCE'             // 복수
  | 'COMBO';                // 콤보
```

### 2.2 런타임 카드 상태 (게임 중)

```typescript
// src/types/cardState.ts

/**
 * 게임 중 카드의 실시간 상태
 */
export interface CardState {
  // 카드 기본 정보
  cardData: CardData;       // 마스터 데이터 (불변)

  // 현재 상태
  location: CardLocation;   // 지금 어디에 있는가?
  owner: string;            // 누구의 카드인가? (playerId)
  controller: string;       // 누가 조종하는가? (보통 owner와 같음)

  // 필드에 있을 때만
  fieldState?: {
    position: number;       // 필드 위치 (0-2)
    currentHp: number;      // 현재 체력 (손상 고려)
    currentAtk: number;     // 현재 공격력 (버프/약화 고려)
    statusEffects: StatusEffect[];
    modifiers: StatModifier[];
    counters: Counter[];    // 카운터 (구름의 표시 등)
    isTapped: boolean;      // 탭/언탭 상태
  };

  // 능력 사용 히스토리
  abilitiesUsed: {
    abilityId: string;
    usedCount: number;      // 이번 턴에 몇 번 사용했는가?
    lastUsedTurn: number;
  }[];

  // 메타데이터
  createdAt: number;        // 게임에서 생성된 시간
  instanceId: string;       // 중복된 카드를 구분하기 위한 ID
}

export type CardLocation =
  | 'DECK'
  | 'HAND'
  | 'FIELD'
  | 'GRAVEYARD'
  | 'BANISHED'
  | 'LIBRARY';              // 덱에서 탐색 중

/**
 * 상태 이상
 */
export interface StatusEffect {
  effectType: StatusEffectType;
  duration: number;         // 남은 턴 수 (-1 = 영구)
  intensity?: number;       // 강도 (중독이면 데미지 양)
  source?: string;          // 누가 건 것인가? (cardId)
}

export type StatusEffectType =
  | 'POISONED'              // 중독
  | 'WEAKENED'              // 약화
  | 'PARALYZED'             // 마비
  | 'STUNNED'               // 기절
  | 'SILENCED'              // 침묵 (능력 사용 불가)
  | 'CURSED'                // 저주 (능력이 역으로 작동)
  | 'PROTECTED';            // 보호 (다음 손상 1회 무시)

/**
 * 스탯 수정자 (버프/약화)
 */
export interface StatModifier {
  source: string;           // 누가 건 것인가? (cardId)
  atkBonus: number;         // +3 또는 -2
  hpBonus: number;
  duration: number;         // 남은 턴 수
}

/**
 * 카운터 (추적용)
 */
export interface Counter {
  name: string;             // "구름의 표시" 등
  count: number;
}
```

---

## 3. 카드 마스터 데이터 예시

### 3.1 저주술사 카드 (JUJUTSU_USER)

```typescript
const yutoKimCard: CardData = {
  // 식별자
  cardId: 'SET01-001',
  setCode: 'SET01',
  cardNumber: 1,

  // 기본 정보
  nameKr: '유토 김',
  nameEn: 'Yuto Kim',
  description: '1급 저주술사, 저주물 파괴 전문가',

  // 분류
  type: 'JUJUTSU_USER',
  subType: '1st-Grade Jujutsu Sorcerer',
  rarity: 'RARE',

  // 비용
  cost: 5,

  // 스탯
  stats: {
    atk: 3,
    hp: 4
  },

  // 핵심: 능력 정의
  abilities: [
    {
      abilityId: 'yuto_treasured_sword',
      name: '비의 자',
      description: '이 저주술사가 플레이될 때, 상대의 저주물 1개를 파괴한다.',
      type: 'PASSIVE',
      triggerCondition: {
        event: 'ON_PLAY'
      },
      effect: {
        effectType: 'DESTROY',
        target: {
          player: 'OPPONENT',
          zone: 'FIELD',
          count: 1,
          filter: {
            type: 'CURSED_OBJECT'
          }
        },
        value: 1
      },
      priority: 100
    },
    {
      abilityId: 'yuto_enhanced_strength',
      name: '강화된 근력',
      description: '턴당 1회, 저주력 3을 지불하고 발동할 수 있다. 이 저주술사의 공격력을 +2 증가시킨다.',
      type: 'ACTIVATED',
      triggerCondition: {
        event: 'ON_TURN_START'  // 턴 중에 발동 가능
      },
      cost: {
        cursedEnergy: 3
      },
      effect: {
        effectType: 'MODIFY_STATS',
        target: {
          player: 'SELF',
          zone: 'FIELD',
          count: 1
        },
        value: 2,
        metadata: {
          statType: 'atk',
          duration: 'THIS_TURN'
        }
      },
      canActivatePerTurn: 1,
      priority: 50
    }
  ],

  // 키워드
  keywords: ['PIERCING'],  // 관통 능력

  // 추가
  flavorText: '저주물 파괴에 진심인 저주술사',
  artistCredit: 'Artist Name',
  illustrationUrl: 'https://cdn.jkcard.dev/cards/SET01-001.jpg',
  releaseDate: new Date('2025-12-01'),
  isLegal: true
};
```

### 3.2 주술 카드 (CURSED_TECHNIQUE)

```typescript
const daiArashiCard: CardData = {
  cardId: 'SET01-042',
  setCode: 'SET01',
  cardNumber: 42,

  nameKr: '대알',
  nameEn: 'Great Wind',
  description: '강력한 바람의 주술',

  type: 'CURSED_TECHNIQUE',
  subType: 'Wind Magic',
  rarity: 'UNCOMMON',

  cost: 3,

  abilities: [
    {
      abilityId: 'daiArashi_main',
      name: '주술 발동',
      description: '상대의 저주술사 1명에게 3 손상을 입힌다. 그 저주술사가 블록당할 수 없다면, 대신 플레이어에게 3 손상을 입힌다.',
      type: 'PASSIVE',
      triggerCondition: {
        event: 'ON_PLAY'
      },
      effect: {
        effectType: 'DAMAGE',
        target: {
          player: 'OPPONENT',
          zone: 'FIELD',
          count: 1
        },
        value: 3,
        metadata: {
          canTargetPlayer: true,
          conditionForPlayerDamage: 'TARGET_CARD_CANNOT_BLOCK'
        }
      },
      priority: 100
    }
  ],

  keywords: [],
  flavorText: '치명적인 바람 주술',
  artistCredit: 'Artist Name',
  illustrationUrl: 'https://cdn.jkcard.dev/cards/SET01-042.jpg',
  releaseDate: new Date('2025-12-01'),
  isLegal: true
};
```

### 3.3 저주물 카드 (CURSED_OBJECT)

```typescript
const itemCard: CardData = {
  cardId: 'SET01-078',
  setCode: 'SET01',
  cardNumber: 78,

  nameKr: '전투복',
  nameEn: 'Combat Suit',
  description: '저주술사를 강화하는 특수 의류',

  type: 'CURSED_OBJECT',
  subType: 'Equipment',
  rarity: 'COMMON',

  cost: 2,

  abilities: [
    {
      abilityId: 'combat_suit_passive',
      name: '체력 강화',
      description: '이 저주물이 필드에 있는 동안, 당신의 저추술사들의 체력이 +1 증가한다.',
      type: 'PASSIVE',
      triggerCondition: {
        event: 'ON_ENTER_FIELD'
      },
      effect: {
        effectType: 'MODIFY_STATS',
        target: {
          player: 'SELF',
          zone: 'FIELD',
          count: 999  // 모든 저주술사
        },
        value: 1,
        metadata: {
          statType: 'hp',
          duration: 'PERMANENT',
          appliesTo: 'ALL_JUJUTSU_USERS'
        }
      },
      priority: 50
    }
  ],

  keywords: [],
  flavorText: '전투력을 증가시키는 신비로운 의류',
  artistCredit: 'Artist Name',
  illustrationUrl: 'https://cdn.jkcard.dev/cards/SET01-078.jpg',
  releaseDate: new Date('2025-12-01'),
  isLegal: true
};
```

---

## 4. 카드 처리 엔진 (Game Logic)

### 4.1 카드 플레이 처리

```typescript
// src/engine/cardEngine.ts

export class CardEngine {
  constructor(
    private gameState: GameState,
    private eventBus: EventBus
  ) {}

  /**
   * 카드 플레이 처리의 핵심 로직
   */
  async playCard(
    cardId: string,
    playerId: string,
    targetCardId?: string
  ): Promise<void> {
    // 1. 카드 찾기
    const card = this.gameState.findCard(cardId);
    if (!card) throw new Error('Card not found');

    // 2. 비용 확인
    const player = this.gameState.getPlayer(playerId);
    if (player.cursedEnergy < card.cardData.cost) {
      throw new Error('Insufficient cursed energy');
    }

    // 3. 카드 타입별 검증
    switch (card.cardData.type) {
      case 'JUJUTSU_USER':
        this.validateJujutsuUserPlay(playerId, card);
        break;
      case 'CURSED_TECHNIQUE':
        this.validateCursedTechniquePlay(card, targetCardId);
        break;
      // ... 기타
    }

    // 4. 비용 지불
    player.cursedEnergy -= card.cardData.cost;

    // 5. 카드를 필드에 배치 또는 효과 실행
    await this.executeCardPlay(card, playerId, targetCardId);

    // 6. 이벤트 발생
    this.eventBus.emit('CARD_PLAYED', { cardId, playerId, cost: card.cardData.cost });
  }

  /**
   * 카드 타입별 실행 로직
   */
  private async executeCardPlay(
    card: CardState,
    playerId: string,
    targetCardId?: string
  ): Promise<void> {
    switch (card.cardData.type) {
      case 'JUJUTSU_USER':
        // 저추술사를 필드에 배치
        this.gameState.addToField(card, playerId);
        // 수동 능력 실행
        await this.executePassiveAbilities(card, 'ON_PLAY');
        break;

      case 'CURSED_TECHNIQUE':
        // 주술은 즉시 효과 실행 후 무덤으로
        await this.executeAbilities(card, 'ON_PLAY', targetCardId);
        this.gameState.moveCard(card, 'GRAVEYARD');
        break;

      case 'CURSED_OBJECT':
        // 저주물을 필드에 배치
        this.gameState.addToField(card, playerId);
        await this.executePassiveAbilities(card, 'ON_ENTER_FIELD');
        break;

      case 'EVENT':
        // 사건은 양쪽에 영향
        await this.executeAbilities(card, 'ON_PLAY', targetCardId);
        this.gameState.moveCard(card, 'GRAVEYARD');
        break;
    }
  }

  /**
   * 능력 실행 (핵심!)
   */
  private async executeAbilities(
    card: CardState,
    triggerEvent: TriggerEvent,
    targetCardId?: string
  ): Promise<void> {
    // 카드의 모든 능력을 가져옴
    const abilities = card.cardData.abilities
      .filter(a => a.triggerCondition.event === triggerEvent)
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));

    for (const ability of abilities) {
      // 조건 확인
      if (!this.checkAbilityCondition(ability, card)) continue;

      // 능력 발동
      await this.executeEffect(ability.effect, card, targetCardId);

      // 능력 사용 횟수 업데이트
      this.updateAbilityUsage(card, ability.abilityId);
    }
  }

  /**
   * 효과 실행 (가장 중요한 부분)
   */
  private async executeEffect(
    effect: EffectPayload,
    sourceCard: CardState,
    targetCardId?: string
  ): Promise<void> {
    const targetCards = this.resolveTarget(effect.target, sourceCard, targetCardId);

    switch (effect.effectType) {
      case 'DAMAGE':
        this.applyDamage(targetCards, effect.value as number, sourceCard);
        break;

      case 'HEAL':
        this.applyHeal(targetCards, effect.value as number);
        break;

      case 'DRAW':
        this.applyDraw(effect.target.player, effect.value as number);
        break;

      case 'DESTROY':
        this.destroyCards(targetCards);
        break;

      case 'MODIFY_STATS':
        this.modifyStats(targetCards, effect);
        break;

      case 'STATUS_EFFECT':
        this.applyStatusEffect(targetCards, effect);
        break;

      // ... 기타 효과들
    }

    this.eventBus.emit('EFFECT_APPLIED', {
      effectType: effect.effectType,
      targets: targetCards.length,
      value: effect.value
    });
  }

  /**
   * 목표 해석
   */
  private resolveTarget(
    target: EffectTarget,
    sourceCard: CardState,
    specificTarget?: string
  ): CardState[] {
    let targetCards: CardState[] = [];

    // 플레이어 범위 결정
    const players = [];
    if (target.player === 'SELF' || target.player === 'BOTH') {
      players.push(sourceCard.owner);
    }
    if (target.player === 'OPPONENT' || target.player === 'BOTH') {
      const opponent = this.gameState.getOpponent(sourceCard.owner);
      players.push(opponent.playerId);
    }

    // 각 플레이어의 카드 조회
    for (const playerId of players) {
      const cardsInZone = this.gameState.getCardsInZone(playerId, target.zone);

      // 필터 적용
      let filtered = cardsInZone;
      if (target.filter) {
        filtered = this.applyFilter(cardsInZone, target.filter);
      }

      // 개수 제한
      if (filtered.length > target.count) {
        // 플레이어가 선택
        filtered = await this.promptPlayerSelection(filtered, target.count);
      }

      targetCards.push(...filtered);
    }

    return targetCards;
  }
}
```

### 4.2 카드 콤보 시스템

```typescript
// src/engine/comboEngine.ts

/**
 * 콤보: 특정 카드 조합이 특별한 효과를 내는 시스템
 */
export class ComboEngine {
  /**
   * 예: "비의 자" (저주물 파괴) + "대알" (손상) = "저주물 파괴 콤보"
   * → 상대의 저주물을 파괴할 때마다 추가 손상
   */
  checkCombo(playedCard: CardData, fieldCards: CardState[]): Combo | null {
    // 비의 자 콤보
    if (playedCard.keywords.includes('PIERCING')) {
      const hasWindMagic = fieldCards.some(c =>
        c.cardData.keywords.includes('PIERCING')
      );

      if (hasWindMagic) {
        return {
          name: '파괴의 협주',
          bonusEffect: 'DAMAGE',
          bonusValue: 2,
          description: '저주물 파괴 + 바람 주술 = 추가 2 손상'
        };
      }
    }

    return null;
  }

  applyComboBonus(combo: Combo, effect: EffectPayload): EffectPayload {
    return {
      ...effect,
      value: (effect.value as number) + combo.bonusValue
    };
  }
}
```

---

## 5. 카드 데이터베이스 저장

### 5.1 Card 테이블 상세 설계

```sql
CREATE TABLE cards (
    card_id VARCHAR(20) PRIMARY KEY,  -- "SET01-001"
    set_code VARCHAR(10) NOT NULL,
    card_number INT NOT NULL,

    -- 기본 정보
    name_en VARCHAR(100) NOT NULL,
    name_kr VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,

    -- 분류
    card_type VARCHAR(50) NOT NULL,  -- JUJUTSU_USER, CURSED_TECHNIQUE, ...
    sub_type VARCHAR(50),
    rarity VARCHAR(20) NOT NULL,

    -- 비용
    cost_main INT NOT NULL CHECK (cost_main >= 0 AND cost_main <= 10),

    -- 스탯 (저주술사만)
    stats_atk INT,
    stats_hp INT,
    power_score DECIMAL(5, 2),

    -- 능력 (JSON으로 저장)
    abilities_json JSONB NOT NULL,  -- CardAbility[] 배열
    keywords_json JSONB NOT NULL,   -- string[] 배열

    -- 텍스트
    text_rules TEXT NOT NULL,
    flavor_text TEXT,

    -- 아트
    artist_name VARCHAR(100),
    artist_credit VARCHAR(100),
    illustration_url VARCHAR(500),

    -- 상태
    is_legal BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,

    -- 타임스탬프
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- 인덱스
    UNIQUE(set_code, card_number),
    INDEX idx_type (card_type),
    INDEX idx_rarity (rarity),
    INDEX idx_cost (cost_main),
    INDEX idx_power_score (power_score)
);

-- 예: 유토 김 카드 INSERT
INSERT INTO cards VALUES (
  'SET01-001',                          -- card_id
  'SET01',                              -- set_code
  1,                                    -- card_number
  'Yuto Kim',                           -- name_en
  '유토 김',                            -- name_kr
  '1급 저주술사, 저주물 파괴 전문가',  -- description
  'JUJUTSU_USER',                       -- card_type
  '1st-Grade Jujutsu Sorcerer',        -- sub_type
  'RARE',                               -- rarity
  5,                                    -- cost
  3,                                    -- stats_atk
  4,                                    -- stats_hp
  1.2,                                  -- power_score
  '[{
    "abilityId": "yuto_treasured_sword",
    "name": "비의 자",
    "description": "이 저주술사가 플레이될 때, 상대의 저주물 1개를 파괴한다.",
    "type": "PASSIVE",
    "triggerCondition": {"event": "ON_PLAY"},
    "effect": {
      "effectType": "DESTROY",
      "target": {"player": "OPPONENT", "zone": "FIELD", "count": 1},
      "value": 1
    },
    "priority": 100
  }]'::jsonb,                           -- abilities_json
  '["PIERCING"]'::jsonb,               -- keywords_json
  '이 저주술사가 플레이될 때, 상대의 저주물 1개를 파괴한다.',
  '저주물 파괴에 진심인 저주술사',
  'Artist Name',
  'Artist Name',
  'https://cdn.jkcard.dev/cards/SET01-001.jpg',
  TRUE,
  TRUE,
  NOW(),
  NOW()
);
```

---

## 6. 카드 캐싱 및 성능

### 6.1 카드 로딩 최적화

```typescript
// src/services/cardService.ts

export class CardService {
  private cardCache: Map<string, CardData> = new Map();
  private cardsLoaded = false;

  /**
   * 게임 시작 시 모든 카드를 메모리에 로드
   */
  async initializeCardCache(): Promise<void> {
    if (this.cardsLoaded) return;

    const response = await api.get('/cards/all');
    const cards: CardData[] = response.data;

    for (const card of cards) {
      this.cardCache.set(card.cardId, card);
    }

    this.cardsLoaded = true;
    console.log(`Loaded ${cards.length} cards into memory`);
  }

  /**
   * O(1) 조회
   */
  getCard(cardId: string): CardData {
    const card = this.cardCache.get(cardId);
    if (!card) throw new Error(`Card not found: ${cardId}`);
    return card;
  }

  /**
   * 필터링된 카드 조회
   */
  searchCards(filters: CardFilters): CardData[] {
    return Array.from(this.cardCache.values()).filter(card => {
      if (filters.type && card.type !== filters.type) return false;
      if (filters.rarity && card.rarity !== filters.rarity) return false;
      if (filters.costMin && card.cost < filters.costMin) return false;
      if (filters.costMax && card.cost > filters.costMax) return false;
      if (filters.keyword && !card.keywords.includes(filters.keyword)) return false;
      return true;
    });
  }
}
```

---

## 7. 카드 밸런싱 데이터

### 7.1 카드 파워 레벨 계산

```typescript
// src/engine/balancingEngine.ts

export class BalancingEngine {
  /**
   * 카드의 파워 스코어 계산
   */
  calculatePowerScore(card: CardData): number {
    let baseValue = 0;

    // 기본 스탯 값
    if (card.stats) {
      baseValue = card.stats.atk + card.stats.hp;
    }

    // 능력 값
    let abilityValue = 0;
    for (const ability of card.abilities) {
      abilityValue += this.getAbilityValue(ability);
    }

    // 키워드 값
    let keywordValue = 0;
    for (const keyword of card.keywords) {
      keywordValue += this.getKeywordValue(keyword);
    }

    const totalValue = baseValue + abilityValue + keywordValue;
    const powerScore = totalValue / card.cost;

    return Math.round(powerScore * 10) / 10; // 소수점 1자리
  }

  private getAbilityValue(ability: CardAbility): number {
    // 능력의 효과에 따라 값 계산
    const effectValue = this.getEffectValue(ability.effect);
    const costModifier = ability.cost ? -2 : 0;

    return effectValue + costModifier;
  }

  private getEffectValue(effect: EffectPayload): number {
    switch (effect.effectType) {
      case 'DAMAGE':
        return (effect.value as number) * 1;     // 손상 1 = 1점
      case 'HEAL':
        return (effect.value as number) * 0.5;   // 회복 1 = 0.5점
      case 'DRAW':
        return (effect.value as number) * 2;     // 드로우 1 = 2점
      case 'DESTROY':
        return (effect.value as number) * 4;     // 파괴 1 = 4점
      case 'MODIFY_STATS':
        return (effect.value as number) * 1.5;   // 스탯 +1 = 1.5점
      default:
        return 0;
    }
  }

  private getKeywordValue(keyword: Keyword): number {
    const keywordValues: Record<Keyword, number> = {
      'PIERCING': 1,
      'EVASION': 1.5,
      'INDESTRUCTIBLE': 2,
      'LIFELINK': 1.5,
      'HASTE': 1,
      'VIGILANCE': 0.5,
      'FLYING': 1,
      'STEALTH': 1.5,
      'VENGEANCE': 2,
      'COMBO': 1.5
    };
    return keywordValues[keyword] || 0;
  }

  /**
   * 카드의 균형 상태 판정
   */
  assessBalance(card: CardData): BalanceAssessment {
    const powerScore = this.calculatePowerScore(card);

    if (powerScore > 1.3) {
      return {
        status: 'OVERPOWERED',
        recommendation: '비용 증가 또는 효과 약화 필요',
        powerScore
      };
    } else if (powerScore < 0.7) {
      return {
        status: 'UNDERPOWERED',
        recommendation: '비용 감소 또는 효과 강화 필요',
        powerScore
      };
    } else {
      return {
        status: 'BALANCED',
        recommendation: '조정 불필요',
        powerScore
      };
    }
  }
}
```

---

## 8. 프론트엔드 카드 표현

### 8.1 React 카드 컴포넌트

```typescript
// src/components/card/CardView.tsx

interface CardViewProps {
  card: CardData;
  size?: 'small' | 'medium' | 'large';
  showAbilities?: boolean;
  playable?: boolean;
  selected?: boolean;
  onClick?: (card: CardData) => void;
}

const CardView: React.FC<CardViewProps> = ({
  card,
  size = 'medium',
  showAbilities = true,
  playable = true,
  selected = false,
  onClick
}) => {
  const cardClasses = classNames('card', {
    [`card-${size}`]: true,
    'card-selected': selected,
    'card-disabled': !playable
  });

  return (
    <div className={cardClasses} onClick={() => onClick?.(card)}>
      {/* 일러스트 */}
      <div className="card-art">
        <img src={card.illustrationUrl} alt={card.nameKr} />
      </div>

      {/* 카드명 */}
      <div className="card-name">
        <h3>{card.nameKr}</h3>
        <p className="card-name-en">{card.nameEn}</p>
      </div>

      {/* 비용 */}
      <div className="card-cost">
        <span className="cost-value">{card.cost}</span>
        <span className="cost-label">비용</span>
      </div>

      {/* 희귀도 */}
      <div className={`card-rarity rarity-${card.rarity.toLowerCase()}`}>
        {card.rarity}
      </div>

      {/* 스탯 (저주술사만) */}
      {card.stats && (
        <div className="card-stats">
          <div className="stat atk">
            <span className="label">공</span>
            <span className="value">{card.stats.atk}</span>
          </div>
          <div className="stat hp">
            <span className="label">체</span>
            <span className="value">{card.stats.hp}</span>
          </div>
        </div>
      )}

      {/* 키워드 */}
      {card.keywords.length > 0 && (
        <div className="card-keywords">
          {card.keywords.map(keyword => (
            <span key={keyword} className={`keyword keyword-${keyword.toLowerCase()}`}>
              {keyword}
            </span>
          ))}
        </div>
      )}

      {/* 능력 설명 */}
      {showAbilities && (
        <div className="card-abilities">
          {card.abilities.map((ability, index) => (
            <div key={index} className="ability">
              <h4>{ability.name}</h4>
              <p>{ability.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* 플레이버 텍스트 */}
      {card.flavorText && (
        <div className="card-flavor">
          <p>"{card.flavorText}"</p>
        </div>
      )}
    </div>
  );
};

export default CardView;
```

---

## 9. 카드 시스템 통합 요약

```
카드 시스템의 3계층:

┌─────────────────────────────────┐
│   UI 계층 (React)                │
│   CardView, Hand, Battlefield   │
└─────────────────────────────────┘
              ↓ (props로 전달)
┌─────────────────────────────────┐
│   게임 로직 계층 (Game Engine)   │
│   CardEngine, ComboEngine        │
│   능력 실행, 효과 처리            │
└─────────────────────────────────┘
              ↓ (저장)
┌─────────────────────────────────┐
│   데이터 계층 (Database)         │
│   Cards Table (CardData)         │
│   마스터 데이터 저장소            │
└─────────────────────────────────┘
```

---

**다음 단계**: 이 카드 시스템을 기반으로 200장의 카드를 설계하고 데이터베이스에 저장합니다.

**예상 작업량**:
- 카드 200장 데이터 입력: 40시간
- 밸런싱 검증: 20시간
- 테스트: 10시간
