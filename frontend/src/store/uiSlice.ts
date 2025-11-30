/**
 * Redux slice for UI state management
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Notification {
  id: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
}

export interface UISliceState {
  selectedCard: string | null;
  selectedTargets: string[];
  hoveredCard: string | null;
  hoveredZone: string | null;
  canPlayCards: boolean;
  canAttack: boolean;
  waitingForOpponent: boolean;
  showHand: boolean;
  showLog: boolean;
  notification: Notification | null;
}

const initialState: UISliceState = {
  selectedCard: null,
  selectedTargets: [],
  hoveredCard: null,
  hoveredZone: null,
  canPlayCards: false,
  canAttack: false,
  waitingForOpponent: false,
  showHand: true,
  showLog: true,
  notification: null
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    selectCard: (state, action: PayloadAction<string | null>) => {
      state.selectedCard = action.payload;
      if (!action.payload) {
        state.selectedTargets = [];
      }
    },

    addTarget: (state, action: PayloadAction<string>) => {
      if (!state.selectedTargets.includes(action.payload)) {
        state.selectedTargets.push(action.payload);
      }
    },

    removeTarget: (state, action: PayloadAction<string>) => {
      state.selectedTargets = state.selectedTargets.filter(t => t !== action.payload);
    },

    clearSelection: (state) => {
      state.selectedCard = null;
      state.selectedTargets = [];
    },

    hoverCard: (state, action: PayloadAction<string | null>) => {
      state.hoveredCard = action.payload;
    },

    hoverZone: (state, action: PayloadAction<string | null>) => {
      state.hoveredZone = action.payload;
    },

    setCanPlayCards: (state, action: PayloadAction<boolean>) => {
      state.canPlayCards = action.payload;
    },

    setCanAttack: (state, action: PayloadAction<boolean>) => {
      state.canAttack = action.payload;
    },

    setWaitingForOpponent: (state, action: PayloadAction<boolean>) => {
      state.waitingForOpponent = action.payload;
    },

    toggleShowHand: (state) => {
      state.showHand = !state.showHand;
    },

    toggleShowLog: (state) => {
      state.showLog = !state.showLog;
    },

    showNotification: (state, action: PayloadAction<Omit<Notification, 'id'>>) => {
      state.notification = {
        id: Date.now().toString(),
        ...action.payload
      };
    },

    clearNotification: (state) => {
      state.notification = null;
    },

    resetUI: (state) => {
      return initialState;
    }
  }
});

export const {
  selectCard,
  addTarget,
  removeTarget,
  clearSelection,
  hoverCard,
  hoverZone,
  setCanPlayCards,
  setCanAttack,
  setWaitingForOpponent,
  toggleShowHand,
  toggleShowLog,
  showNotification,
  clearNotification,
  resetUI
} = uiSlice.actions;

export default uiSlice.reducer;
