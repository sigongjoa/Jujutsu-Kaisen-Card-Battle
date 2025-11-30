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
  resetGame
} = gameSlice.actions;

export default gameSlice.reducer;
