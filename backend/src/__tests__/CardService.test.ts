/**
 * Card Service tests
 */

import { CardService } from '../services/CardService';
import { CardType, CardLocation } from '../types';

describe('CardService', () => {
  let cardService: CardService;

  beforeEach(() => {
    cardService = new CardService();
  });

  describe('getCard', () => {
    it('should return card data by ID', () => {
      const card = cardService.getCard('JK-001-YUJI');
      expect(card).toBeDefined();
      expect(card?.name).toBe('Yuji Itadori');
      expect(card?.type).toBe(CardType.JUJUTSU_USER);
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
    });

    it('should throw error for non-existent card', () => {
      expect(() => {
        cardService.createCardInstance('NON-EXISTENT', 'user-1');
      }).toThrow('Card not found');
    });
  });

  describe('getCardStats', () => {
    it('should return base stats without modifiers', () => {
      const cardData = cardService.getCard('JK-001-YUJI');
      const instance = cardService.createCardInstance('JK-001-YUJI', 'user-1');

      expect(cardData).toBeDefined();
      const stats = cardService.getCardStats(instance, cardData!);
      expect(stats.atk).toBe(9);
      expect(stats.def).toBe(2);
    });
  });

  describe('hasKeyword', () => {
    it('should detect Piercing keyword', () => {
      const cardData = cardService.getCard('JK-001-YUJI');
      expect(cardData).toBeDefined();
      expect(cardService.hasKeyword(cardData!, 'Piercing')).toBe(true);
    });

    it('should return false for non-existent keyword', () => {
      const cardData = cardService.getCard('JK-001-YUJI');
      expect(cardData).toBeDefined();
      expect(cardService.hasKeyword(cardData!, 'NonExistent')).toBe(false);
    });
  });

  describe('getCardCost', () => {
    it('should return base cost', () => {
      const cardData = cardService.getCard('JK-001-YUJI');
      const instance = cardService.createCardInstance('JK-001-YUJI', 'user-1');

      expect(cardData).toBeDefined();
      const cost = cardService.getCardCost(instance, cardData!);
      expect(cost).toBe(4);
    });
  });
});
