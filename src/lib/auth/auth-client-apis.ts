'use client';

import { store } from '@/states/client';
import { refreshToken } from '@/states/client/slices/auth-slice';
import { AuthPlugin } from '../providers';
import { adminRefresh } from '@/states/client/slices/admin-slice';

// const dispatch = useAppDispatch();

export const authRefreshToken = async () => {
  const response = await store.dispatch(refreshToken());
  if (
    response.meta.requestStatus === 'rejected' ||
    !(response.payload as { success: boolean; message: string })?.success
  ) {
    throw new Error((response.payload as { success: boolean; message: string })?.message);
  }

  return { token: (response.payload as { data: { token: string } })?.data?.token };
};

export const authAdminRefresh = async () => {
  const response = await store.dispatch(adminRefresh());
  if (
    response.meta.requestStatus === 'rejected' ||
    !(response.payload as { success: boolean; message: string })?.success
  ) {
    throw new Error((response.payload as { success: boolean; message: string })?.message);
  }

  return { token: (response.payload as { data: { token: string } })?.data?.token };
};

export function createAuthPlugin(): AuthPlugin {
  return {
    refreshToken: () => authRefreshToken(),
  };
}

export const getClientAuthToken = () => store?.getState()?.auth?.token;
export const getAdminAuthToken = () => store?.getState()?.admin?.token;

export const triggerClientRefresh = async () => {
  await store?.dispatch(refreshToken());
};
