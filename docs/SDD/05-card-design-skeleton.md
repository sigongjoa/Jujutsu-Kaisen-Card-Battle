# SDD 05: Card Design Skeleton (카드 설계 골격)

**Document Type**: Game Design Document (카드 설계 기본 구조)
**Status**: Active
**Last Updated**: 2025-11-30
**Target Audience**: Card Designers, Balance Team, Game Developers

---

## 1. Overview

This document defines the framework for designing, implementing, and balancing all 200 cards in the Jujutsu Kaisen Card Battle system. It ensures consistency across all cards while allowing for creative variety and strategic depth.

## 2. Card Design Principles

### 2.1 Core Design Philosophy
- **Authenticity to Source**: Each card should evoke the character, technique, or object from Jujutsu Kaisen
- **Strategic Viability**: Every card should have at least one viable competitive deck archetype
- **Readability**: New players should understand card function within 10 seconds of reading it
- **Balanced Complexity**: Mechanics should be intuitive but allow for strategic depth

### 2.2 Design Pillars
1. **Authenticity** - Capture the essence of source material
2. **Clarity** - Simple, unambiguous mechanics
3. **Depth** - Multiple viable strategies for using each card
4. **Balance** - No card dominates the meta for >6 months
5. **Flavor** - Visual design and mechanics reinforce character identity

## 3. Card Archetype System

### 3.1 Five Character Archetypes

All JUJUTSU_USER cards (80 cards total) fall into one of five archetypes:

#### 3.1.1 Offensive (공격형) - 20 Cards
- **Philosophy**: High damage output, glass cannon
- **Primary Stat**: ATK (8-12), low DEF (1-3)
- **Common Abilities**: Multi-target damage, stat boosts, piercing
- **Weakness**: Low survivability, requires protection
- **Example Cards**: Yuji Itadori (Physical Attacker), Sukuna (Destructive Power)
- **Deck Role**: Primary damage dealer, combo enabler

**Stat Distribution**:
- ATK: 8-12 (average 10)
- DEF: 1-3 (average 2)
- Cost: 3-7 Cursed Energy

#### 3.1.2 Defensive (방어형) - 20 Cards
- **Philosophy**: Board control through protection and healing
- **Primary Stat**: DEF (8-12), variable ATK
- **Common Abilities**: Damage reduction, evasion, healing, taunt
- **Strength**: Prolonged survival, resource denial
- **Example Cards**: Gojo Satoru (Invulnerability Specialist), Maki (Defensive Technique)
- **Deck Role**: Protector, stabilizer, tempo control

**Stat Distribution**:
- ATK: 2-5 (average 3)
- DEF: 8-12 (average 10)
- Cost: 3-7 Cursed Energy

#### 3.1.3 Control (제어형) - 15 Cards
- **Philosophy**: Manipulate opponent's resources and tempo
- **Primary Stat**: Ability effects over stats
- **Common Abilities**: Card draw disruption, cost manipulation, bounce effects
- **Strength**: Tempo advantage, resource advantage
- **Example Cards**: Gege Akutami (Manipulation Master), Yuki Tsukumo (Reality Manipulation)
- **Deck Role**: Tempo setter, card advantage generator

**Stat Distribution**:
- ATK: 3-6 (average 4)
- DEF: 3-6 (average 4)
- Cost: 4-8 Cursed Energy

#### 3.1.4 Combo (조합형) - 15 Cards
- **Philosophy**: Synergies with other cards, multiplier effects
- **Primary Stat**: Conditional effects and synergies
- **Common Abilities**: Triggers on specific card types, stat bonuses for allies
- **Strength**: Explosive turns when conditions met, deck consistency
- **Example Cards**: Maki (Cursed Tool Specialist), Nanami (Systematic Combo)
- **Deck Role**: Synergy linchpin, damage multiplier

**Stat Distribution**:
- ATK: 5-8 (average 6)
- DEF: 4-7 (average 5)
- Cost: 3-6 Cursed Energy

#### 3.1.5 Hybrid (혼합형) - 10 Cards
- **Philosophy**: Balanced across multiple roles, adaptive
- **Primary Stat**: Balanced ATK/DEF with flexible abilities
- **Common Abilities**: Mix of attack, defense, and utility
- **Strength**: Flexible deck building, consistent performance
- **Example Cards**: Toji Fushiguro (Well-Rounded), Megumi Fushiguro (Adaptive)
- **Deck Role**: Flex slot, responsive gameplay

**Stat Distribution**:
- ATK: 6-8 (average 7)
- DEF: 5-7 (average 6)
- Cost: 4-6 Cursed Energy

### 3.2 Technique Card Archetypes (40 Cards)

CURSED_TECHNIQUE cards provide powers and buffs:

#### 3.2.1 Offensive Techniques (12 Cards)
- Damage multiplication, stat boost, piercing, multi-target
- Examples: "Expand", "Domain Expansion", "Cursed Speech"
- Cost Range: 2-6 Cursed Energy

#### 3.2.2 Defensive Techniques (12 Cards)
- Damage reduction, evasion, healing, protective effects
- Examples: "Blue", "Red", "Limitless Defense"
- Cost Range: 2-5 Cursed Energy

#### 3.2.3 Control Techniques (8 Cards)
- Card draw, hand manipulation, cost adjustment
- Examples: "Thread Manipulation", "Gravity Manipulation"
- Cost Range: 3-7 Cursed Energy

#### 3.2.4 Utility Techniques (8 Cards)
- Special effects, removal, bounce, status manipulation
- Examples: "Enchain", "Smoke Screen"
- Cost Range: 2-4 Cursed Energy

### 3.3 Cursed Object Card Archetypes (40 Cards)

CURSED_OBJECT cards are powerful one-time or limited use effects:

#### 3.3.1 Weapons (15 Cards)
- Permanent stat boosts, equipment synergy
- Examples: "Playful Cloud", "Cursed Tool", "Sacred Treasure"
- Cost Range: 2-5 Cursed Energy

#### 3.3.2 Artifacts (15 Cards)
- Special effects, condition triggers, utility
- Examples: "Cursed Womb", "Binding Vow", "Sacred Ground"
- Cost Range: 2-6 Cursed Energy

#### 3.3.3 Consumables (10 Cards)
- One-time powerful effects, resource generation
- Examples: "Cursed Potion", "Energy Crystal", "Binding Seal"
- Cost Range: 1-4 Cursed Energy

### 3.4 Event Card Archetypes (30 Cards)

EVENT cards are instant effects triggered during specific phases:

#### 3.4.1 Offensive Events (10 Cards)
- Damage spells, stat boosters
- Examples: "Cursed Technique: Surge", "Overwhelming Power"
- Cost Range: 1-5 Cursed Energy

#### 3.4.2 Defensive Events (8 Cards)
- Damage negation, protective effects
- Examples: "Barrier Defense", "Emergency Evasion"
- Cost Range: 1-4 Cursed Energy

#### 3.4.3 Draw Events (6 Cards)
- Card advantage generators
- Examples: "Strategic Insight", "Cursed Energy Recharge"
- Cost Range: 2-4 Cursed Energy

#### 3.4.4 Control Events (6 Cards)
- Removal, disruption
- Examples: "Forced Surrender", "Sealing Technique"
- Cost Range: 2-5 Cursed Energy

### 3.5 Response Card Archetypes (10 Cards)

RESPONSE cards are instant reactions to opponent actions:

- **Interrupt Responses** (3 Cards): Block actions mid-resolution
- **Reaction Responses** (4 Cards): Trigger after opponent action
- **Chained Responses** (3 Cards): Chain from other responses
- Cost Range: 1-3 Cursed Energy

## 4. Card Power Scoring System

### 4.1 Power Score Formula

Each card receives a **Power Score (PS)** from 1-10 based on its efficiency:

```
Power Score = (Stat Value + Ability Value + Synergy Value) / 3
```

**Stat Value** (1-10):
- Sum of ATK and DEF, normalized to 1-10 scale
- Cost adjustment: Higher cost = higher stat value acceptable
- Formula: ((ATK + DEF) / Cost) × 1.5, capped at 10

**Ability Value** (1-10):
- Impact of card abilities on game state
- 1 = Minimal (passive 1% damage boost)
- 5 = Moderate (draw 1 card, +2 ATK to ally)
- 8 = Significant (destroy enemy card, heal 5 HP)
- 10 = Game-changing (turn skip, cost reduction, instant win setup)

**Synergy Value** (1-10):
- How well card works within its archetype
- Combos with other cards in same deck
- 1 = No synergies, standalone
- 5 = Works with 1-2 other card types
- 10 = Enables entire deck archetype

### 4.2 Power Score Bands

| Band | Range | Classification | Playability |
|------|-------|-----------------|------------|
| S+ | 9.0-10.0 | Iconic/Meta-defining | Universal (all decks) |
| S | 8.0-8.9 | Excellent | Tier-1 decks |
| A | 7.0-7.9 | Very Good | Tier-2 decks |
| B | 6.0-6.9 | Good | Budget/Casual |
| C | 5.0-5.9 | Moderate | Draft/Limited |
| D | 4.0-4.9 | Below Average | Niche/Combo |
| F | <4.0 | Unplayable | Unsupported |

### 4.3 Distribution Target

Across all 200 cards:
- S+ Tier: 3-5 cards (1.5-2.5%) - Iconic cards, rarely dominant long-term
- S Tier: 12-15 cards (6-7.5%) - Tier-1 meta cards
- A Tier: 30-35 cards (15-17.5%) - Competitive core
- B Tier: 40-50 cards (20-25%) - Viable/Flexible
- C Tier: 50-60 cards (25-30%) - Draft/Limited viable
- D Tier: 40-50 cards (20-25%) - Niche/Fun/Casual
- F Tier: 5-10 cards (2.5-5%) - Intentionally underpowered (for tournament legal purposes)

## 5. Card Template System

### 5.1 Master Card Template

Every card follows this structure:

```yaml
Card Template:
  Basic Info:
    - Card ID (e.g., JK-001-YUJI)
    - Card Name
    - Card Type (JUJUTSU_USER | CURSED_TECHNIQUE | CURSED_OBJECT | EVENT | RESPONSE)
    - Archetype (OFFENSIVE | DEFENSIVE | CONTROL | COMBO | HYBRID)
    - Cost (1-8 Cursed Energy)
    - Rarity (COMMON | UNCOMMON | RARE | LEGENDARY)

  Stats (if applicable):
    - Attack (0-12)
    - Defense (0-12)
    - Health/Durability (varies by type)

  Abilities:
    - Passive Ability (triggers automatically)
    - Triggered Ability (triggers on condition)
    - Activated Ability (costs energy to trigger)

  Keywords:
    - List of applicable keywords (Piercing, Evasion, Indestructible, etc.)

  Flavor:
    - Character/Object Description
    - Narrative Tie-in
    - Art Direction Notes

  Metadata:
    - Power Score (1-10)
    - Meta Tier (S+, S, A, B, C, D, F)
    - Synergy Decks (list of 2-3 deck archetypes)
    - Set (Base Set, Expansion 1, etc.)
    - Release Date
```

### 5.2 Ability Template

Each ability follows:

```yaml
Ability Name:
  Type: [PASSIVE | TRIGGERED | ACTIVATED]
  Trigger: [None | On condition]
  Effect Payload:
    - Effect Type (DAMAGE, HEAL, DRAW, DESTROY, etc.)
    - Target (Self | Ally | Enemy | All)
    - Value (numeric or variable)
    - Condition (optional)
  Resolution:
    - Timing (Before/After/During/End)
    - Priority (1-10)
    - Repeatable (Y/N)
  Text:
    - Rules Text (player-facing)
    - Oracle Text (clear and unambiguous)
```

## 6. Cost Analysis and Efficiency

### 6.1 Cost Curves by Archetype

**Offensive Cards**:
```
Cost 3: ATK 8, DEF 1 (PS: 5.0)
Cost 4: ATK 9, DEF 2 (PS: 6.0)
Cost 5: ATK 10, DEF 3 (PS: 6.5)
Cost 6: ATK 11, DEF 2 (PS: 6.8)
Cost 7: ATK 12, DEF 3 (PS: 7.2)
```

**Defensive Cards**:
```
Cost 3: ATK 2, DEF 8 (PS: 5.0)
Cost 4: ATK 3, DEF 9 (PS: 6.0)
Cost 5: ATK 4, DEF 10 (PS: 6.5)
Cost 6: ATK 3, DEF 11 (PS: 6.8)
Cost 7: ATK 4, DEF 12 (PS: 7.2)
```

**Control Cards**:
```
Cost 4: Ability Value 6 (PS: 6.0)
Cost 5: Ability Value 7 (PS: 6.8)
Cost 6: Ability Value 8 (PS: 7.5)
Cost 7: Ability Value 9 (PS: 8.2)
Cost 8: Ability Value 10 (PS: 9.0)
```

**Combo Cards**:
```
Cost 3: Base 4/4 + 2-card synergy (PS: 5.5)
Cost 4: Base 5/5 + 3-card synergy (PS: 6.8)
Cost 5: Base 6/6 + 4-card synergy (PS: 7.5)
Cost 6: Base 7/7 + 5+ card synergy (PS: 8.2)
```

### 6.2 Mana Curve Guidelines

A healthy deck (40 cards) should have:

```
Cost 1: 2-4 cards (5-10%) - Fast setup
Cost 2: 3-6 cards (8-15%) - Early game
Cost 3: 6-10 cards (15-25%) - Mid game core
Cost 4: 6-10 cards (15-25%) - Mid game versatility
Cost 5: 5-8 cards (12-20%) - Late game power
Cost 6: 3-6 cards (8-15%) - Finisher
Cost 7+: 2-4 cards (5-10%) - Game-ender
```

## 7. Keyword Mechanics Reference

### 7.1 Keyword Definitions

**Piercing**: This card's damage ignores Evasion and Damage Reduction effects.

**Evasion**: First instance of damage this turn is reduced to 0. (Can only avoid 1 attack per turn)

**Indestructible**: This card cannot be destroyed by opponent effects. (Damage > 0 reduces HP but doesn't destroy)

**Lifelink**: Whenever this card deals damage, you gain that much HP (max +3 per turn).

**Combo**: Bonus effect if you control a card of type [X].

**Overload**: This ability can be triggered multiple times per turn (max 3 times).

**Binding Vow**: Choose an effect - gain benefit but accept penalty.

**Domain**: This card creates a zone where your other cards gain +1/+1.

**Resonance**: This ability triggers when another card with Resonance is played.

**Cursed Seal**: This card prevents opponent from playing cards of type [X] next turn.

## 8. Design Workflow

### 8.1 Card Design Phase

**Step 1: Concept (Day 1-2)**
- Select character/object from source material
- Determine archetype and power tier
- Write 1-2 sentence ability concept
- Assign estimated cost (1-8 CE)

**Step 2: Mechanics (Day 2-4)**
- Write ability text in plain language
- Define stat targets (ATK/DEF/Cost)
- Calculate preliminary Power Score
- Identify 2-3 synergy decks

**Step 3: Implementation (Day 4-5)**
- Write Oracle text (unambiguous rules)
- Create ability payloads (JSON structure)
- Test against comprehensive rules
- Verify keyword interactions

**Step 4: Balance (Day 5-6)**
- Internal playtesting (8+ games)
- Power Score adjustment
- Mana curve analysis
- Synergy verification

**Step 5: Refinement (Day 6-7)**
- Flavor text and art direction
- Final power level adjustment
- QA check (rules lawyer review)
- Commit to card database

### 8.2 Playtesting Scenarios

Each card must be tested in:
1. **Isolated Test**: Card alone against basic opponent
2. **Synergy Test**: Card with 2-3 synergy partners
3. **Counter Test**: Card against hard counters
4. **Meta Test**: Card in top-3 current meta decks
5. **Draft Test**: Card in random 40-card limited pool

### 8.3 Approval Criteria

Card is approved for release when:
- [ ] Mechanics tested in 8+ games
- [ ] Power Score within target band (±0.3)
- [ ] No infinite loop exploits possible
- [ ] Oracle text reviewed by rules lawyer
- [ ] Flavor aligned with source material
- [ ] Art direction brief completed
- [ ] No breaking interactions with existing cards

## 9. Balance Maintenance

### 9.1 Post-Release Monitoring

**Weekly**:
- Track win rates in top decks
- Monitor usage statistics
- Identify potential exploits

**Monthly**:
- Power score recalculation
- Meta tier reassessment
- Identify over/underpowered cards

**Quarterly**:
- Full meta analysis
- Set rotation planning
- Errata or reprint decisions

### 9.2 Power Correction Guidelines

| Situation | Action | Frequency |
|-----------|--------|-----------|
| Card dominates meta (>60% win rate) | Errata ability OR reprint at +1 cost | <6 months |
| Card underused (<5% inclusion) | Errata ability OR reprint at -1 cost | Monthly |
| Card breaks rules/creates exploits | Emergency errata or ban | Immediate |
| Card creates unhealthy meta | Restrict to 1-copy deck limit | 2-4 weeks |
| Multiple cards dominate together | Rotate set to Limited | 6 months |

### 9.3 Errata Examples

**Before**: Piercing Strike - Cost 3, Deal 5 damage with Piercing
**After**: Piercing Strike - Cost 4, Deal 5 damage with Piercing
*(Reason: 60% inclusion rate, underpowered defenders)*

**Before**: Protective Ward - Cost 5, Your creatures gain Evasion
**After**: Protective Ward - Cost 5, Target creature gains Evasion this turn
*(Reason: Broken with Indestructible combo, infinite protection)*

## 10. Card Database Structure

All 200 cards stored in PostgreSQL with JSON abilities:

```json
{
  "cardId": "JK-001-YUJI",
  "name": "Yuji Itadori",
  "type": "JUJUTSU_USER",
  "archetype": "OFFENSIVE",
  "cost": 4,
  "rarity": "LEGENDARY",
  "stats": {
    "atk": 9,
    "def": 2,
    "maxHp": 15
  },
  "powerScore": 6.8,
  "metaTier": "A",
  "abilities": [
    {
      "abilityId": "YU01-PASSIVE",
      "name": "Cursed Impulse",
      "type": "PASSIVE",
      "triggerCondition": "ON_TURN_START",
      "effect": {
        "type": "GAIN_STAT",
        "target": "SELF",
        "stat": "ATK",
        "value": 1,
        "duration": "THIS_TURN"
      }
    }
  ],
  "keywords": ["Piercing"],
  "synergies": ["Offensive Deck", "Cursed Energy Combo"],
  "flavor": {
    "description": "Yuji Itadori, the protagonist...",
    "artDirectionNotes": "Dynamic pose, intense eyes, cursed energy aura..."
  }
}
```

## 11. Reference: Sample Cards

### 11.1 Sample Card 1: Offensive Archetype

```
Card: Yuji Itadori (Physical Attacker)
ID: JK-001-YUJI
Type: JUJUTSU_USER
Archetype: OFFENSIVE
Cost: 4 Cursed Energy
Rarity: Legendary

Stats:
  Attack: 9
  Defense: 2
  Health: 15

Passive Ability - "Cursed Impulse":
  Effect: Gain +1 ATK at the start of each of your turns
  Trigger: Each turn start
  Repeatable: Yes

Triggered Ability - "Overflowing Potential":
  Condition: When you play a Cursed Technique card
  Effect: Deal 3 damage to opponent + Gain +2 ATK this turn
  Timing: After Technique resolves

Keywords: Piercing (can damage through Evasion)

Power Score: 6.8 (A-Tier)
Meta Decks: Offensive Core, Cursed Energy Combo, Physical Attacker Combo

Flavor: The main protagonist whose fighting spirit grows with each battle.
His physical attacks are enhanced by cursed energy flow.
```

### 11.2 Sample Card 2: Defensive Archetype

```
Card: Gojo Satoru (Limitless Master)
ID: JK-020-GOJO
Type: JUJUTSU_USER
Archetype: DEFENSIVE
Cost: 6 Cursed Energy
Rarity: Legendary

Stats:
  Attack: 3
  Defense: 11
  Health: 20

Passive Ability - "Limitless Domain":
  Effect: Your other creatures gain +0/+1 and Evasion
  Trigger: While this card is on field
  Repeatable: Continuous

Activated Ability - "Blue / Red" (costs 2 CE):
  Effect: Choose - Negate next damage this turn OR Deal 4 damage to target
  Timing: Can be used in response
  Repeatable: Once per turn

Keywords: Indestructible (cannot be destroyed by opponent effects)

Power Score: 7.9 (S-Tier)
Meta Decks: Defensive Control, Protection Stack, Balanced Hybrid

Flavor: The strongest jujutsu sorcerer whose cursed technique creates an
absolute defensive domain. His technique manipulates space itself.
```

### 11.3 Sample Card 3: Combo Archetype

```
Card: Maki Zenin (Cursed Tool Master)
ID: JK-045-MAKI
Type: JUJUTSU_USER
Archetype: COMBO
Cost: 4 Cursed Energy
Rarity: Rare

Stats:
  Attack: 6
  Defense: 5
  Health: 12

Passive Ability - "Cursed Tool Affinity":
  Effect: Whenever you play a Cursed Object, gain +1/+1 and draw 1 card
  Trigger: After Cursed Object enters field
  Repeatable: Yes (max 3 times per turn)

Combo Ability - "Coordinated Strike":
  Condition: You control 2+ Cursed Objects
  Effect: +3 ATK this turn and Piercing
  Timing: Calculated at attack time
  Repeatable: Each turn if condition met

Keywords: Combo (enhanced with Cursed Objects)

Power Score: 7.2 (A-Tier)
Meta Decks: Cursed Object Synergy, Combo Enabler, Equipment Stack

Flavor: Master of cursed tools, Maki becomes increasingly powerful as
she equips more forbidden weapons.
```

## 12. Conclusion

This Card Design Skeleton provides a comprehensive framework for creating, balancing, and maintaining 200 unique cards. By following these archetypes, power scoring, and design workflows, the game remains mechanically balanced while preserving creative expression and character authenticity.

The skeleton is designed to scale with the game—as new cards are added or the meta evolves, designers can refer back to these principles to ensure consistency and balance.

---

**Next Steps**:
1. Designers complete 10 sample cards per archetype (50 cards)
2. Rules lawyer verifies all ability interactions
3. Balance team playtests 8+ scenarios per card
4. Iterate based on feedback
5. Database implementation and API integration
