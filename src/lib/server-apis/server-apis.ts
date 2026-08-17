/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { serverAdminRefreshApi, serverRefreshApi } from './server-utils';
import { singleFlight } from './single-flight';

export const serverRefresh = async () =>
  singleFlight('server-user-refresh', async () => {
    const response = await serverRefreshApi();
    if (!response.data?.success) {
      throw new Error(response.data.message);
    }

    let setCookie: string[] = [];
    const headers = response.headers;

    if (typeof headers?.getSetCookie === 'function') {
      setCookie = headers.getSetCookie() ?? [];
    }
    // else if ('set-cookie' in headers) {
    //   // If it's already an array, use directly. If it's a string, wrap to array.
    //   const rawVal = (headers as any)['set-cookie'];
    //   if (Array.isArray(rawVal)) setCookie = rawVal;
    //   else if (typeof rawVal === 'string') setCookie = [rawVal];
    // }

    return { token: response.data?.data?.token, setCookie };

    // return {
    //   token: response.data.data?.token,
    // };
  });

export const serverAdminRefresh = async () =>
  singleFlight('server-admin-refresh', async () => {
    const response = await serverAdminRefreshApi();
    if (!response.data?.success) {
      throw new Error(response.data.message);
    }
    let setCookie: string[] = [];
    const headers = response.headers;

    if (typeof headers?.getSetCookie === 'function') {
      setCookie = headers.getSetCookie() ?? [];
    } else {
      // Axios compatibility: check various casing for set-cookie
      const rawVal =
        (headers as any)['set-cookie'] ||
        (headers as any)['Set-Cookie'] ||
        (headers as any)['set-Cookie'];

      if (Array.isArray(rawVal)) {
        setCookie = rawVal;
      } else if (typeof rawVal === 'string') {
        setCookie = [rawVal];
      }
    }

    return { token: response.data?.data?.token, setCookie };
  });
