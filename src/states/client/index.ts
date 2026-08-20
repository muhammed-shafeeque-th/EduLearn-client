'use client';

import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import type { AuthUser } from '@/types/auth';
import type { AuthState } from './slices/auth-slice';

import { store } from './store';

export type { RootState, AppDispatch } from './store';

export const useAppDispatch = () => useDispatch<typeof store.dispatch>();

export const useAppSelector: TypedUseSelectorHook<ReturnType<typeof store.getState>> = useSelector;

export const useAuthUserSelector = (): AuthUser | null =>
  useAppSelector((state) => state.auth.user);

export const useAuthSelector = (): AuthState => useAppSelector((state) => state.auth);

export const useIsAuthenticatedSelector = (): boolean =>
  useAppSelector((state) => state.auth.status === 'authenticated');

export const useAuthIsAuthenticated = useIsAuthenticatedSelector;

export const useAdminSelector = () => useAppSelector((state) => state.admin);

export { store };
