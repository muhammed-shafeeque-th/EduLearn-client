'use client';

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/auth-slice';
import adminReducer from './slices/admin-slice';
// import uiReducer from './slices/_ui-slice';
// import messagingReducer from './slices/_messaging-slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer,
    // ui: uiReducer,
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

export function getStore() {
  return store;
}
