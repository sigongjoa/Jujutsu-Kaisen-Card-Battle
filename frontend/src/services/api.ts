/**
 * API service for communicating with backend
 */

import axios, { AxiosInstance } from 'axios';
import { GameState, Deck, DeckListItem } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add token to requests
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // ============= Auth =============

  async register(email: string, password: string, username: string) {
    const response = await this.client.post('/auth/register', {
      email,
      password,
      username
    });
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', {
      email,
      password
    });
    return response.data;
  }

  async getProfile() {
    const response = await this.client.get('/auth/profile');
    return response.data;
  }

  // ============= Deck =============

  async createDeck(name: string, description: string, cards: DeckListItem[]) {
    const response = await this.client.post('/deck', {
      name,
      description,
      cards
    });
    return response.data;
  }

  async getDecks() {
    const response = await this.client.get('/deck');
    return response.data;
  }

  async getDeck(deckId: string) {
    const response = await this.client.get(`/deck/${deckId}`);
    return response.data;
  }

  async updateDeck(deckId: string, updates: Partial<{ name: string; description: string; cards: DeckListItem[] }>) {
    const response = await this.client.patch(`/deck/${deckId}`, updates);
    return response.data;
  }

  async deleteDeck(deckId: string) {
    await this.client.delete(`/deck/${deckId}`);
  }

  async getDeckStats(deckId: string) {
    const response = await this.client.get(`/deck/${deckId}/stats`);
    return response.data;
  }

  // ============= Game =============

  async createGame(opponentId: string) {
    const response = await this.client.post('/game/create', {
      opponentId
    });
    return response.data;
  }

  async startGame(gameId: string) {
    const response = await this.client.post(`/game/${gameId}/start`);
    return response.data;
  }

  async getGame(gameId: string) {
    const response = await this.client.get(`/game/${gameId}`);
    return response.data;
  }

  async playCard(gameId: string, cardInstanceId: string, targetIds: string[] = []) {
    const response = await this.client.post(`/game/${gameId}/play`, {
      cardInstanceId,
      targetIds
    });
    return response.data;
  }

  async declareAttacks(gameId: string, attacks: any[]) {
    const response = await this.client.post(`/game/${gameId}/attack`, {
      attacks
    });
    return response.data;
  }

  async passAction(gameId: string) {
    const response = await this.client.post(`/game/${gameId}/pass`);
    return response.data;
  }

  async surrender(gameId: string) {
    const response = await this.client.post(`/game/${gameId}/surrender`);
    return response.data;
  }
}

export const apiService = new ApiService();
