/**
 * WebSocket service for real-time game updates
 */

import { GameState, WebSocketMessage } from '../types';

export type WebSocketCallback = (message: WebSocketMessage) => void;

export class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private gameId: string | null = null;
  private token: string | null = null;
  private callbacks: Map<string, Set<WebSocketCallback>> = new Map();
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;

  constructor(url: string = 'ws://localhost:8000') {
    this.url = url;
  }

  /**
   * Connect to WebSocket server
   */
  connect(gameId: string, token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.gameId = gameId;
        this.token = token;

        const wsUrl = `${this.url}/game/${gameId}?token=${token}`;
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          this.emit('connected', { type: 'connected', data: {}, timestamp: Date.now() });
          resolve();
        };

        this.ws.onmessage = (event) => {
          const message = JSON.parse(event.data) as WebSocketMessage;
          this.handleMessage(message);
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.emit('error', { type: 'error', data: { message: 'Connection error' }, timestamp: Date.now() });
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.attemptReconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Send a message through WebSocket
   */
  send(type: string, data: any): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected');
      return;
    }

    const message: WebSocketMessage = {
      type,
      data,
      timestamp: Date.now()
    };

    this.ws.send(JSON.stringify(message));
  }

  /**
   * Subscribe to message type
   */
  on(messageType: string, callback: WebSocketCallback): () => void {
    if (!this.callbacks.has(messageType)) {
      this.callbacks.set(messageType, new Set());
    }

    this.callbacks.get(messageType)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.callbacks.get(messageType)?.delete(callback);
    };
  }

  /**
   * Emit message to subscribers
   */
  private emit(messageType: string, message: WebSocketMessage): void {
    const callbacks = this.callbacks.get(messageType);
    if (callbacks) {
      callbacks.forEach(callback => callback(message));
    }
  }

  /**
   * Handle incoming message
   */
  private handleMessage(message: WebSocketMessage): void {
    // Emit to specific message type subscribers
    this.emit(message.type, message);

    // Emit to all subscribers
    this.emit('*', message);
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.gameId && this.token) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

      console.log(`Reconnecting in ${delay}ms... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

      setTimeout(() => {
        this.connect(this.gameId!, this.token!).catch((error) => {
          console.error('Reconnection failed:', error);
        });
      }, delay);
    } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.emit('disconnected', {
        type: 'disconnected',
        data: { message: 'Permanently disconnected' },
        timestamp: Date.now()
      });
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

export const wsService = new WebSocketService(process.env.REACT_APP_WS_URL || 'ws://localhost:8000');
