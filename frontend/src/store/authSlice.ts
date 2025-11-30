/**
 * Redux slice for authentication state management
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserProfile {
  userId: string;
  username: string;
  displayName: string;
  bio?: string;
  avatar?: string;
  totalGames: number;
  totalWins: number;
  eloRating: number;
  joinedAt: Date;
}

export interface AuthSliceState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthSliceState = {
  isAuthenticated: false,
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    loginSuccess: (state, action: PayloadAction<{ user: UserProfile; token: string }>) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.loading = false;
      state.error = null;
      localStorage.setItem('token', action.payload.token);
    },

    loginFailure: (state, action: PayloadAction<string>) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.loading = false;
      state.error = action.payload;
    },

    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('token');
    },

    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },

    clearError: (state) => {
      state.error = null;
    }
  }
});

export const {
  setLoading,
  loginSuccess,
  loginFailure,
  logout,
  setError,
  clearError
} = authSlice.actions;

export default authSlice.reducer;
