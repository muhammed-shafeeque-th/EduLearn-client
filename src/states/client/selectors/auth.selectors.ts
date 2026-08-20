import type { RootState } from '../store';

export const selectIsAuthenticated = (state: RootState) =>
  state.auth.status === 'authenticated' && !!state.auth.token && state.auth.user !== null;

export const selectAuthStatus = (state: RootState) => state.auth.status;

export const selectUser = (state: RootState) => state.auth.user;

export const selectAuthLoading = (state: RootState) => state.auth.isLoading;

export const selectAuthError = (state: RootState) => state.auth.error;
