'use client';

import { refreshToken } from '@/states/client/slices/auth-slice';
import { adminRefresh } from '@/states/client/slices/admin-slice';
import { store } from '@/states/client/store';

const isClient = typeof window !== 'undefined';

export async function authRefreshToken() {
  if (!isClient) {
    throw new Error('authRefreshToken must be invoked in the browser context');
  }

  const currentStore = store;
  if (!currentStore) {
    throw new Error('Redux store not available');
  }

  const response = await currentStore.dispatch(refreshToken());
  if (
    response.meta.requestStatus === 'rejected' ||
    !(response.payload as { success: boolean; message: string })?.success
  ) {
    throw new Error((response.payload as { success: boolean; message: string })?.message);
  }

  return { token: (response.payload as { data: { token: string } })?.data?.token };
}

export async function authAdminRefresh() {
  if (!isClient) {
    throw new Error('authAdminRefresh must be invoked in the browser context');
  }

  const currentStore = store;
  if (!currentStore) {
    throw new Error('Redux store not available');
  }

  const response = await currentStore.dispatch(adminRefresh());
  if (
    response.meta.requestStatus === 'rejected' ||
    !(response.payload as { success: boolean; message: string })?.success
  ) {
    throw new Error((response.payload as { success: boolean; message: string })?.message);
  }

  return { token: (response.payload as { data: { token: string } })?.data?.token };
}

export function createAuthPlugin() {
  return {
    refreshToken: () => authRefreshToken(),
  };
}

export function getClientAuthToken() {
  if (!isClient) return null;

  const currentStore = store;
  return currentStore?.getState()?.auth?.token ?? null;
}

export function getAdminAuthToken() {
  if (!isClient) return null;

  const currentStore = store;
  return currentStore?.getState()?.admin?.token ?? null;
}

export async function triggerClientRefresh() {
  if (!isClient) {
    throw new Error('triggerClientRefresh must be invoked in the browser context');
  }

  const currentStore = store;
  if (!currentStore) {
    throw new Error('Redux store not available');
  }

  await currentStore.dispatch(refreshToken());
}
