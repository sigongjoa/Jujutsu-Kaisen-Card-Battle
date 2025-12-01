/**
 * Redux slice for game state management
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GameState, GamePhase, PlayerGameState } from '../types';

export interface GameSliceState {
  gameId: string | null;
  gameState: GameState | null;
  loading: boolean;
  error: string | null;
  connected: boolean;
  optimisticBackup?: GameState;
}

const initialState: GameSliceState = {
  gameId: null,
  gameState: null,
  loading: false,
  error: null,
  connected: false
};

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    // Game creation
    setGameId: (state, action: PayloadAction<string>) => {
      state.gameId = action.payload;
    },

    // Game state updates
    updateGameState: (state, action: PayloadAction<GameState>) => {
      state.gameState = action.payload;
      state.error = null;
      // Clear backup on successful update if it matches our expectation? 
      // Actually, usually we clear backup when we get the authoritative state.
      state.optimisticBackup = undefined;
    },

    updatePhase: (state, action: PayloadAction<GamePhase>) => {
      if (state.gameState) {
        state.gameState.currentPhase = action.payload;
      }
    },

    // Loading states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    // Error handling
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },

    clearError: (state) => {
      state.error = null;
    },

    // Connection state
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.connected = action.payload;
    },

    // Reset game
    resetGame: (state) => {
      state.gameId = null;
      state.gameState = null;
      state.loading = false;
      state.error = null;
      state.optimisticBackup = undefined;
    },

    // Optimistic UI
    optimisticPlayCard: (state, action: PayloadAction<{ cardInstanceId: string; userId: string }>) => {
      if (state.gameState) {
        // Backup current state
        state.optimisticBackup = JSON.parse(JSON.stringify(state.gameState));

        const { cardInstanceId, userId } = action.payload;
        const player = state.gameState.players[userId];

        if (player) {
          const cardIdx = player.hand.findIndex(c => c.cardInstanceId === cardInstanceId);
          if (cardIdx > -1) {
            const [card] = player.hand.splice(cardIdx, 1);
            player.field.push(card);
            // Optionally deduct cost or other optimistic updates here
          }
        }
      }
    },

    rollbackGameState: (state) => {
      if (state.optimisticBackup) {
        state.gameState = state.optimisticBackup;
        state.optimisticBackup = undefined;
      }
    }
  }
});

export const {
  setGameId,
  updateGameState,
  updatePhase,
  setLoading,
  setError,
  clearError,
  setConnected,
  resetGame,
  optimisticPlayCard,
  rollbackGameState
} = gameSlice.actions;

export default gameSlice.reducer;
