/**
 * Redux store configuration
 */

import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './gameSlice';
import uiReducer from './uiSlice';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    game: gameReducer,
    ui: uiReducer,
    auth: authReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
