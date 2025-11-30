/**
 * Deck Service - Manages user decks
 */

import { Deck, DeckListItem, CreateDeckRequest } from '../types';
import { CardService, cardService } from './CardService';
import { v4 as uuidv4 } from 'uuid';

export class DeckService {
  private decks: Map<string, Deck> = new Map();
  private userDecks: Map<string, string[]> = new Map(); // userId -> deckIds
  private cardService: CardService;

  constructor() {
    this.cardService = cardService;
  }

  /**
   * Create a new deck
   */
  createDeck(ownerId: string, request: CreateDeckRequest): Deck {
    // Validate deck
    const validation = this.validateDeck(request.cards);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const deckId = uuidv4();
    const deck: Deck = {
      deckId,
      ownerId,
      name: request.name,
      description: request.description,
      cards: request.cards,
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublic: false
    };

    this.decks.set(deckId, deck);

    // Add to user's decks
    if (!this.userDecks.has(ownerId)) {
      this.userDecks.set(ownerId, []);
    }
    this.userDecks.get(ownerId)!.push(deckId);

    return deck;
  }

  /**
   * Get deck by ID
   */
  getDeck(deckId: string): Deck | null {
    return this.decks.get(deckId) || null;
  }

  /**
   * Get user's decks
   */
  getUserDecks(userId: string): Deck[] {
    const deckIds = this.userDecks.get(userId) || [];
    return deckIds
      .map(id => this.decks.get(id))
      .filter((deck): deck is Deck => deck !== undefined);
  }

  /**
   * Update deck
   */
  updateDeck(deckId: string, userId: string, request: Partial<CreateDeckRequest>): Deck {
    const deck = this.decks.get(deckId);
    if (!deck) {
      throw new Error('Deck not found');
    }

    if (deck.ownerId !== userId) {
      throw new Error('Unauthorized');
    }

    // Validate if cards are being updated
    if (request.cards) {
      const validation = this.validateDeck(request.cards);
      if (!validation.valid) {
        throw new Error(validation.error);
      }
      deck.cards = request.cards;
    }

    if (request.name) deck.name = request.name;
    if (request.description !== undefined) deck.description = request.description;

    deck.updatedAt = new Date();

    return deck;
  }

  /**
   * Delete deck
   */
  deleteDeck(deckId: string, userId: string): void {
    const deck = this.decks.get(deckId);
    if (!deck) {
      throw new Error('Deck not found');
    }

    if (deck.ownerId !== userId) {
      throw new Error('Unauthorized');
    }

    this.decks.delete(deckId);

    // Remove from user's decks
    const userDeckIds = this.userDecks.get(userId) || [];
    const index = userDeckIds.indexOf(deckId);
    if (index !== -1) {
      userDeckIds.splice(index, 1);
    }
  }

  /**
   * Validate deck
   */
  private validateDeck(cards: DeckListItem[]): { valid: boolean; error?: string } {
    // Check minimum cards
    const totalCards = cards.reduce((sum, item) => sum + item.quantity, 0);
    if (totalCards < 40) {
      return { valid: false, error: 'Deck must have at least 40 cards' };
    }

    if (totalCards > 50) {
      return { valid: false, error: 'Deck must have at most 50 cards' };
    }

    // Check card limits (max 3 of same card)
    for (const item of cards) {
      if (item.quantity > 3) {
        return { valid: false, error: `Cannot have more than 3 copies of ${item.cardId}` };
      }

      // Check if card exists
      const card = this.cardService.getCard(item.cardId);
      if (!card) {
        return { valid: false, error: `Card not found: ${item.cardId}` };
      }
    }

    return { valid: true };
  }

  /**
   * Get deck stats
   */
  getDeckStats(deck: Deck): {
    totalCards: number;
    averageCost: number;
    cardsByType: Record<string, number>;
  } {
    const totalCards = deck.cards.reduce((sum, item) => sum + item.quantity, 0);

    let totalCost = 0;
    let cardCount = 0;
    const cardsByType: Record<string, number> = {};

    for (const item of deck.cards) {
      const card = this.cardService.getCard(item.cardId);
      if (card) {
        totalCost += card.cost * item.quantity;
        cardCount += item.quantity;

        const type = card.type;
        cardsByType[type] = (cardsByType[type] || 0) + item.quantity;
      }
    }

    const averageCost = cardCount > 0 ? totalCost / cardCount : 0;

    return {
      totalCards,
      averageCost: Math.round(averageCost * 100) / 100,
      cardsByType
    };
  }
}

export const deckService = new DeckService();
