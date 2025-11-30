/**
 * Card Service tests - Comprehensive test suite
 */

import { CardService } from '../services/CardService';
import { CardType, CardLocation, CardRarity, CardArchetype } from '../types';

describe('CardService', () => {
  let cardService: CardService;

  beforeEach(() => {
    cardService = new CardService();
  });

  describe('Card Initialization', () => {
    it('should initialize exactly 10 cards', () => {
      const allCards = cardService.getAllCards();
      expect(allCards.length).toBe(10);
    });

    it('should initialize all card types', () => {
      const cardTypes = new Set(cardService.getAllCards().map(c => c.type));
      expect(cardTypes.has(CardType.JUJUTSU_USER)).toBe(true);
      expect(cardTypes.has(CardType.CURSED_TECHNIQUE)).toBe(true);
      expect(cardTypes.has(CardType.CURSED_OBJECT)).toBe(true);
      expect(cardTypes.has(CardType.EVENT)).toBe(true);
      expect(cardTypes.has(CardType.RESPONSE)).toBe(true);
    });

    it('should initialize all rarities', () => {
      const rarities = new Set(cardService.getAllCards().map(c => c.rarity));
      expect(rarities.size).toBeGreaterThan(0);
    });
  });

  describe('getCard', () => {
    it('should return Yuji Itadori card (OFFENSIVE - LEGENDARY)', () => {
      const card = cardService.getCard('JK-001-YUJI');
      expect(card).toBeDefined();
      expect(card?.name).toBe('Yuji Itadori');
      expect(card?.type).toBe(CardType.JUJUTSU_USER);
      expect(card?.archetype).toBe(CardArchetype.OFFENSIVE);
      expect(card?.rarity).toBe(CardRarity.LEGENDARY);
      expect(card?.cost).toBe(4);
      expect(card?.stats?.atk).toBe(9);
      expect(card?.stats?.def).toBe(2);
    });

    it('should return Gojo Satoru card (DEFENSIVE - LEGENDARY)', () => {
      const card = cardService.getCard('JK-020-GOJO');
      expect(card).toBeDefined();
      expect(card?.name).toBe('Gojo Satoru');
      expect(card?.archetype).toBe(CardArchetype.DEFENSIVE);
      expect(card?.keywords).toContain('Indestructible');
    });

    it('should return Megumi Fushiguro card (CONTROL - RARE)', () => {
      const card = cardService.getCard('JK-002-MEGUMI');
      expect(card).toBeDefined();
      expect(card?.name).toBe('Megumi Fushiguro');
      expect(card?.archetype).toBe(CardArchetype.CONTROL);
      expect(card?.rarity).toBe(CardRarity.RARE);
    });

    it('should return Nobara Kugisaki card (OFFENSIVE - RARE)', () => {
      const card = cardService.getCard('JK-003-NOBARA');
      expect(card).toBeDefined();
      expect(card?.name).toBe('Nobara Kugisaki');
      expect(card?.type).toBe(CardType.JUJUTSU_USER);
    });

    it('should return all 10 cards by ID', () => {
      const cardIds = [
        'JK-001-YUJI', 'JK-020-GOJO', 'JK-050-GREAT-WIND',
        'JK-002-MEGUMI', 'JK-003-NOBARA', 'JK-100-SURGE',
        'JK-101-BARRIER', 'JK-200-CLOUD', 'JK-300-HEAL', 'JK-102-DOMAIN'
      ];

      for (const cardId of cardIds) {
        const card = cardService.getCard(cardId);
        expect(card).toBeDefined();
        expect(card?.cardId).toBe(cardId);
      }
    });

    it('should return undefined for non-existent card', () => {
      const card = cardService.getCard('NON-EXISTENT');
      expect(card).toBeUndefined();
    });
  });

  describe('createCardInstance', () => {
    it('should create card instance with correct properties', () => {
      const instance = cardService.createCardInstance('JK-001-YUJI', 'user-1', CardLocation.HAND);
      expect(instance.cardId).toBe('JK-001-YUJI');
      expect(instance.ownerId).toBe('user-1');
      expect(instance.location).toBe(CardLocation.HAND);
      expect(instance.position).toBe('FACE_UP');
      expect(instance.tappedStatus).toBe(false);
      expect(instance.modifiers).toEqual([]);
      expect(instance.statusEffects).toEqual([]);
    });

    it('should create instance in different locations', () => {
      const locations = [CardLocation.HAND, CardLocation.DECK, CardLocation.FIELD, CardLocation.GRAVEYARD];
      for (const location of locations) {
        const instance = cardService.createCardInstance('JK-001-YUJI', 'user-1', location);
        expect(instance.location).toBe(location);
      }
    });

    it('should generate unique instance IDs', () => {
      const instance1 = cardService.createCardInstance('JK-001-YUJI', 'user-1');
      const instance2 = cardService.createCardInstance('JK-001-YUJI', 'user-1');
      expect(instance1.cardInstanceId).not.toBe(instance2.cardInstanceId);
    });

    it('should throw error for non-existent card', () => {
      expect(() => {
        cardService.createCardInstance('NON-EXISTENT', 'user-1');
      }).toThrow('Card not found');
    });
  });

  describe('getCardStats', () => {
    it('should return base stats for Yuji Itadori', () => {
      const cardData = cardService.getCard('JK-001-YUJI');
      const instance = cardService.createCardInstance('JK-001-YUJI', 'user-1');
      const stats = cardService.getCardStats(instance, cardData!);
      expect(stats.atk).toBe(9);
      expect(stats.def).toBe(2);
    });

    it('should return base stats for Gojo Satoru', () => {
      const cardData = cardService.getCard('JK-020-GOJO');
      const instance = cardService.createCardInstance('JK-020-GOJO', 'user-1');
      const stats = cardService.getCardStats(instance, cardData!);
      expect(stats.atk).toBe(3);
      expect(stats.def).toBe(11);
    });

    it('should return non-negative stats', () => {
      for (const card of cardService.getAllCards()) {
        const instance = cardService.createCardInstance(card.cardId, 'user-1');
        const stats = cardService.getCardStats(instance, card);
        expect(stats.atk).toBeGreaterThanOrEqual(0);
        expect(stats.def).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('hasKeyword', () => {
    it('should detect Piercing keyword on Yuji', () => {
      const card = cardService.getCard('JK-001-YUJI');
      expect(cardService.hasKeyword(card!, 'Piercing')).toBe(true);
    });

    it('should detect Indestructible keyword on Gojo', () => {
      const card = cardService.getCard('JK-020-GOJO');
      expect(cardService.hasKeyword(card!, 'Indestructible')).toBe(true);
    });

    it('should detect Evasion keyword on Playful Cloud', () => {
      const card = cardService.getCard('JK-200-CLOUD');
      expect(cardService.hasKeyword(card!, 'Evasion')).toBe(true);
    });

    it('should return false for non-existent keyword', () => {
      const card = cardService.getCard('JK-001-YUJI');
      expect(cardService.hasKeyword(card!, 'NonExistent')).toBe(false);
    });
  });

  describe('getCardCost', () => {
    it('should return correct costs for all cards', () => {
      const expectedCosts: Record<string, number> = {
        'JK-001-YUJI': 4,
        'JK-020-GOJO': 6,
        'JK-050-GREAT-WIND': 3,
        'JK-002-MEGUMI': 5,
        'JK-003-NOBARA': 3,
        'JK-100-SURGE': 2,
        'JK-101-BARRIER': 2,
        'JK-200-CLOUD': 4,
        'JK-300-HEAL': 2,
        'JK-102-DOMAIN': 7
      };

      for (const [cardId, expectedCost] of Object.entries(expectedCosts)) {
        const cardData = cardService.getCard(cardId);
        const instance = cardService.createCardInstance(cardId, 'user-1');
        const cost = cardService.getCardCost(instance, cardData!);
        expect(cost).toBe(expectedCost);
      }
    });

    it('should return non-negative cost', () => {
      for (const card of cardService.getAllCards()) {
        const instance = cardService.createCardInstance(card.cardId, 'user-1');
        const cost = cardService.getCardCost(instance, card);
        expect(cost).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('Card Abilities', () => {
    it('should have abilities for all cards', () => {
      for (const card of cardService.getAllCards()) {
        expect(card.abilities).toBeDefined();
        expect(card.abilities.length).toBeGreaterThan(0);
      }
    });

    it('should have valid ability types', () => {
      const validTypes = ['PASSIVE', 'TRIGGERED', 'ACTIVATED'];
      for (const card of cardService.getAllCards()) {
        for (const ability of card.abilities) {
          expect(validTypes).toContain(ability.type);
        }
      }
    });

    it('should have valid effect types', () => {
      const validEffects = ['DAMAGE', 'HEAL', 'DRAW', 'DESTROY', 'MODIFY_STAT', 'GAIN_KEYWORD'];
      for (const card of cardService.getAllCards()) {
        for (const ability of card.abilities) {
          expect(validEffects).toContain(ability.effect.type);
        }
      }
    });
  });

  describe('Card Distribution', () => {
    it('should have balanced cost distribution', () => {
      const costs = cardService.getAllCards().map(c => c.cost);
      const minCost = Math.min(...costs);
      const maxCost = Math.max(...costs);
      expect(minCost).toBeLessThanOrEqual(3);
      expect(maxCost).toBeGreaterThanOrEqual(6);
    });

    it('should have balanced rarity distribution', () => {
      const rarities = cardService.getAllCards().map(c => c.rarity);
      expect(rarities).toContain(CardRarity.LEGENDARY);
      expect(rarities).toContain(CardRarity.RARE);
      expect(rarities).toContain(CardRarity.UNCOMMON);
      expect(rarities).toContain(CardRarity.COMMON);
    });

    it('should have different archetypes', () => {
      const archetypes = new Set(cardService.getAllCards().map(c => c.archetype));
      expect(archetypes.size).toBeGreaterThan(1);
    });
  });
});
