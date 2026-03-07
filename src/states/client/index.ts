import { configureStore } from '@reduxjs/toolkit';
import authReducer, { AuthState } from './slices/auth-slice';
import adminReducer, { AdminState } from './slices/admin-slice';
import uiReducer from './slices/_ui-slice';
// import messagingReducer from './slices/_messaging-slice';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { AuthUser } from '@/types/auth';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer,
    ui: uiReducer,
    // messaging: messagingReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['messaging/setSocket'],
        ignoredPaths: ['messaging.socket'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Typed Selector hooks
export const useAuthUserSelector: () => AuthUser | null = () =>
  useAppSelector((state) => state.auth.user);
export const useAuthSelector: () => AuthState = () => useAppSelector((state) => state.auth);
export const useAuthIsAuthenticated: () => boolean = () =>
  useAppSelector((state) => state.auth.status === 'authenticated');

export const useAdminSelector: () => AdminState = () => useAppSelector((state) => state.admin);
