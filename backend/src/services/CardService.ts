/**
 * Card Service - Manages card data and card instances
 */

import { CardData, CardInstance, CardAbility, CardType, CardArchetype, CardLocation, CardRarity } from '../types';
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
    // Sample card 1: Yuji Itadori (Offensive)
    const yuji: CardData = {
      cardId: 'JK-001-YUJI',
      name: 'Yuji Itadori',
      type: CardType.JUJUTSU_USER,
      archetype: CardArchetype.OFFENSIVE,
      cost: 4,
      rarity: CardRarity.LEGENDARY,
      stats: {
        atk: 9,
        def: 2,
        maxHp: 15
      },
      abilities: [
        {
          abilityId: 'YU01-PASSIVE',
          name: 'Cursed Impulse',
          type: 'PASSIVE',
          effect: {
            type: 'MODIFY_STAT',
            target: 'SELF',
            stat: 'ATK',
            value: 1,
            duration: 'UNTIL_END_OF_TURN'
          },
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
    };

    // Sample card 2: Gojo Satoru (Defensive)
    const gojo: CardData = {
      cardId: 'JK-020-GOJO',
      name: 'Gojo Satoru',
      type: CardType.JUJUTSU_USER,
      archetype: CardArchetype.DEFENSIVE,
      cost: 6,
      rarity: CardRarity.LEGENDARY,
      stats: {
        atk: 3,
        def: 11,
        maxHp: 20
      },
      abilities: [
        {
          abilityId: 'GO01-PASSIVE',
          name: 'Limitless Domain',
          type: 'PASSIVE',
          effect: {
            type: 'MODIFY_STAT',
            target: 'ALLY',
            stat: 'DEF',
            value: 1,
            duration: 'PERMANENT'
          },
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
    };

    // Sample card 3: Great Wind Technique
    const greatWind: CardData = {
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
          type: 'ACTIVATED',
          cost: 3,
          effect: {
            type: 'DAMAGE',
            target: 'ENEMY',
            value: 5
          },
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
    };

    this.cards.set(yuji.cardId, yuji);
    this.cards.set(gojo.cardId, gojo);
    this.cards.set(greatWind.cardId, greatWind);
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

    // Apply cost modifiers
    for (const modifier of cardInstance.modifiers) {
      if (!modifier.isActive || modifier.type !== 'COST_REDUCTION') continue;
      cost -= modifier.value || 0;
    }

    return Math.max(0, cost);
  }
}

export const cardService = new CardService();
