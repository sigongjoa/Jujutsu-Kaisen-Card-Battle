/**
 * Card Service - Manages card data and card instances
 */

import { CardData, CardInstance, CardType, CardArchetype, CardLocation, CardRarity, AbilityType, EffectType, TriggerCondition } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class CardService {
  private cards: Map<string, CardData> = new Map();

  constructor() {
    this.initializeSampleCards();
  }

  /**
   * Initialize sample cards for testing
   */
  private initializeSampleCards(): void {
    // Card 1: Yuji Itadori (OFFENSIVE - LEGENDARY)
    this.cards.set('JK-001-YUJI', {
      cardId: 'JK-001-YUJI',
      name: 'Yuji Itadori',
      type: CardType.JUJUTSU_USER,
      archetype: CardArchetype.OFFENSIVE,
      cost: 4,
      rarity: CardRarity.LEGENDARY,
      stats: { atk: 9, def: 2, maxHp: 15 },
      abilities: [
        {
          abilityId: 'YU01-PASSIVE',
          name: 'Cursed Impulse',
          type: AbilityType.PASSIVE,
          effect: { type: EffectType.MODIFY_STAT, target: 'SELF', stat: 'ATK', value: 1, duration: 'UNTIL_END_OF_TURN' },
          timing: 'IMMEDIATE',
          priority: 1,
          repeatable: true
        }
      ],
      keywords: ['Piercing'],
      powerScore: 6.8,
      metaTier: 'A',
      description: 'Yuji Itadori, the protagonist whose fighting spirit grows with each battle.',
      flavorText: 'His physical attacks are enhanced by cursed energy flow.'
    });

    // Card 2: Gojo Satoru (DEFENSIVE - LEGENDARY)
    this.cards.set('JK-020-GOJO', {
      cardId: 'JK-020-GOJO',
      name: 'Gojo Satoru',
      type: CardType.JUJUTSU_USER,
      archetype: CardArchetype.DEFENSIVE,
      cost: 6,
      rarity: CardRarity.LEGENDARY,
      stats: { atk: 3, def: 11, maxHp: 20 },
      abilities: [
        {
          abilityId: 'GO01-PASSIVE',
          name: 'Limitless Domain',
          type: AbilityType.PASSIVE,
          effect: { type: EffectType.MODIFY_STAT, target: 'ALLY', stat: 'DEF', value: 1, duration: 'PERMANENT' },
          timing: 'IMMEDIATE',
          priority: 1,
          repeatable: false
        }
      ],
      keywords: ['Indestructible'],
      powerScore: 7.9,
      metaTier: 'S',
      description: 'The strongest jujutsu sorcerer whose cursed technique creates an absolute defensive domain.',
      flavorText: 'His technique manipulates space itself.'
    });

    // Card 3: Great Wind Technique (TECHNIQUE - UNCOMMON)
    this.cards.set('JK-050-GREAT-WIND', {
      cardId: 'JK-050-GREAT-WIND',
      name: 'Great Wind Technique',
      type: CardType.CURSED_TECHNIQUE,
      archetype: CardArchetype.OFFENSIVE,
      cost: 3,
      rarity: CardRarity.UNCOMMON,
      abilities: [
        {
          abilityId: 'GW01-EFFECT',
          name: 'Devastating Blast',
          type: AbilityType.ACTIVATED,
          cost: 3,
          effect: { type: EffectType.DAMAGE, target: 'ENEMY', value: 5 },
          timing: 'STACK',
          priority: 5,
          repeatable: false
        }
      ],
      keywords: [],
      powerScore: 5.5,
      metaTier: 'C',
      description: 'A powerful cursed technique that strikes with wind-like force.',
      flavorText: 'Devastating power with precise control.'
    });

    // Card 4: Megumi Fushiguro (CONTROL - RARE)
    this.cards.set('JK-002-MEGUMI', {
      cardId: 'JK-002-MEGUMI',
      name: 'Megumi Fushiguro',
      type: CardType.JUJUTSU_USER,
      archetype: CardArchetype.CONTROL,
      cost: 5,
      rarity: CardRarity.RARE,
      stats: { atk: 6, def: 6, maxHp: 14 },
      abilities: [
        {
          abilityId: 'MG01-TRIGGERED',
          name: 'Shadow Manifestation',
          type: AbilityType.TRIGGERED,
          triggerCondition: TriggerCondition.ENTER_FIELD,
          effect: { type: EffectType.DRAW, target: 'SELF', value: 1 },
          timing: 'IMMEDIATE',
          priority: 2,
          repeatable: false
        }
      ],
      keywords: [],
      powerScore: 6.5,
      metaTier: 'A',
      description: 'Megumi commands his cursed spirits with tactical precision.',
      flavorText: 'The Divine Dogs are always under his command.'
    });

    // Card 5: Nobara Kugisaki (OFFENSIVE - RARE)
    this.cards.set('JK-003-NOBARA', {
      cardId: 'JK-003-NOBARA',
      name: 'Nobara Kugisaki',
      type: CardType.JUJUTSU_USER,
      archetype: CardArchetype.OFFENSIVE,
      cost: 3,
      rarity: CardRarity.RARE,
      stats: { atk: 7, def: 3, maxHp: 12 },
      abilities: [
        {
          abilityId: 'NB01-PASSIVE',
          name: 'Straw Doll Technique',
          type: AbilityType.PASSIVE,
          effect: { type: EffectType.DAMAGE, target: 'ENEMY', value: 2 },
          timing: 'IMMEDIATE',
          priority: 1,
          repeatable: true
        }
      ],
      keywords: [],
      powerScore: 6.0,
      metaTier: 'B',
      description: 'Nobara Kugisaki uses cursed nails as her primary weapon.',
      flavorText: 'Sturdy, reliable, and always ready for action.'
    });

    // Card 6: Curse Energy Surge (EVENT - COMMON)
    this.cards.set('JK-100-SURGE', {
      cardId: 'JK-100-SURGE',
      name: 'Curse Energy Surge',
      type: CardType.EVENT,
      archetype: CardArchetype.OFFENSIVE,
      cost: 2,
      rarity: CardRarity.COMMON,
      abilities: [
        {
          abilityId: 'SG01-EFFECT',
          name: 'Power Boost',
          type: AbilityType.ACTIVATED,
          effect: { type: EffectType.MODIFY_STAT, target: 'ALLY', stat: 'ATK', value: 2, duration: 'UNTIL_END_OF_TURN' },
          timing: 'IMMEDIATE',
          priority: 3,
          repeatable: false
        }
      ],
      keywords: [],
      powerScore: 5.2,
      metaTier: 'C',
      description: 'Momentary surge in cursed energy power.',
      flavorText: 'All attacks gain additional force.'
    });

    // Card 7: Protective Barrier (EVENT - UNCOMMON)
    this.cards.set('JK-101-BARRIER', {
      cardId: 'JK-101-BARRIER',
      name: 'Protective Barrier',
      type: CardType.EVENT,
      archetype: CardArchetype.DEFENSIVE,
      cost: 2,
      rarity: CardRarity.UNCOMMON,
      abilities: [
        {
          abilityId: 'BR01-EFFECT',
          name: 'Defense Boost',
          type: AbilityType.ACTIVATED,
          effect: { type: EffectType.MODIFY_STAT, target: 'ALLY', stat: 'DEF', value: 3, duration: 'UNTIL_END_OF_TURN' },
          timing: 'IMMEDIATE',
          priority: 3,
          repeatable: false
        }
      ],
      keywords: [],
      powerScore: 5.3,
      metaTier: 'C',
      description: 'A protective barrier shields you from harm.',
      flavorText: 'Temporary but effective defense.'
    });

    // Card 8: Cursed Tool - Playful Cloud (CURSED_OBJECT - RARE)
    this.cards.set('JK-200-CLOUD', {
      cardId: 'JK-200-CLOUD',
      name: 'Playful Cloud',
      type: CardType.CURSED_OBJECT,
      archetype: CardArchetype.COMBO,
      cost: 4,
      rarity: CardRarity.RARE,
      stats: { atk: 4, def: 2 },
      abilities: [
        {
          abilityId: 'CLD01-PASSIVE',
          name: 'Agile Movement',
          type: AbilityType.PASSIVE,
          effect: { type: EffectType.GAIN_KEYWORD, target: 'SELF', value: 1 },
          timing: 'IMMEDIATE',
          priority: 1,
          repeatable: false
        }
      ],
      keywords: ['Evasion'],
      powerScore: 6.2,
      metaTier: 'B',
      description: 'A mystical cursed tool that grants incredible mobility.',
      flavorText: 'Ancient treasure of immense power.'
    });

    // Card 9: Healing Touch (RESPONSE - COMMON)
    this.cards.set('JK-300-HEAL', {
      cardId: 'JK-300-HEAL',
      name: 'Healing Touch',
      type: CardType.RESPONSE,
      archetype: CardArchetype.DEFENSIVE,
      cost: 2,
      rarity: CardRarity.COMMON,
      abilities: [
        {
          abilityId: 'HL01-EFFECT',
          name: 'Restore Health',
          type: AbilityType.ACTIVATED,
          effect: { type: EffectType.HEAL, target: 'PLAYER', value: 5 },
          timing: 'IMMEDIATE',
          priority: 2,
          repeatable: false
        }
      ],
      keywords: [],
      powerScore: 5.5,
      metaTier: 'C',
      description: 'Quick healing to recover lost health.',
      flavorText: 'Restores vitality in critical moments.'
    });

    // Card 10: Domain Expansion (EVENT - LEGENDARY)
    this.cards.set('JK-102-DOMAIN', {
      cardId: 'JK-102-DOMAIN',
      name: 'Domain Expansion',
      type: CardType.EVENT,
      archetype: CardArchetype.HYBRID,
      cost: 7,
      rarity: CardRarity.LEGENDARY,
      abilities: [
        {
          abilityId: 'DM01-EFFECT',
          name: 'Reality Distortion',
          type: AbilityType.ACTIVATED,
          effect: { type: EffectType.DAMAGE, target: 'ENEMY', value: 8 },
          timing: 'STACK',
          priority: 10,
          repeatable: false
        },
        {
          abilityId: 'DM02-PASSIVE',
          name: 'Domain Field',
          type: AbilityType.PASSIVE,
          effect: { type: EffectType.MODIFY_STAT, target: 'ALLY', stat: 'DEF', value: 2, duration: 'UNTIL_END_OF_TURN' },
          timing: 'IMMEDIATE',
          priority: 1,
          repeatable: false
        }
      ],
      keywords: ['Indestructible'],
      powerScore: 8.5,
      metaTier: 'S+',
      description: 'The ultimate cursed technique that expands your personal domain.',
      flavorText: 'An overwhelming technique of unmatched power.'
    });
  }

  /**
   * Get card data by ID
   */
  getCard(cardId: string): CardData | undefined {
    return this.cards.get(cardId);
  }

  /**
   * Get all cards
   */
  getAllCards(): CardData[] {
    return Array.from(this.cards.values());
  }

  /**
   * Create a card instance
   */
  createCardInstance(cardId: string, ownerId: string, location: CardLocation = CardLocation.DECK): CardInstance {
    const cardData = this.getCard(cardId);
    if (!cardData) {
      throw new Error(`Card not found: ${cardId}`);
    }

    return {
      cardInstanceId: uuidv4(),
      cardId,
      ownerId,
      location,
      position: 'FACE_UP',
      tappedStatus: false,
      currentHp: cardData.stats?.maxHp || 0,
      modifiers: [],
      statusEffects: [],
      counters: {}
    };
  }

  /**
   * Get card stats with modifiers applied
   */
  getCardStats(cardInstance: CardInstance, cardData: CardData): { atk: number; def: number } {
    let atk = cardData.stats?.atk || 0;
    let def = cardData.stats?.def || 0;

    // Apply modifiers
    for (const modifier of cardInstance.modifiers) {
      if (!modifier.isActive) continue;

      if (modifier.type === 'STAT_BOOST') {
        if (modifier.stat === 'ATK') atk += modifier.value || 0;
        if (modifier.stat === 'DEF') def += modifier.value || 0;
      } else if (modifier.type === 'STAT_REDUCTION') {
        if (modifier.stat === 'ATK') atk -= modifier.value || 0;
        if (modifier.stat === 'DEF') def -= modifier.value || 0;
      }
    }

    return { atk: Math.max(0, atk), def: Math.max(0, def) };
  }

  /**
   * Check if card has keyword
   */
  hasKeyword(cardData: CardData, keyword: string): boolean {
    return cardData.keywords.includes(keyword);
  }

  /**
   * Get card cost
   */
  getCardCost(cardInstance: CardInstance, cardData: CardData): number {
    let cost = cardData.cost;

    // Note: Cost reduction modifiers not yet implemented
    // This is placeholder for future cost reduction mechanics
    (cardInstance);

    return Math.max(0, cost);
  }
}

export const cardService = new CardService();
