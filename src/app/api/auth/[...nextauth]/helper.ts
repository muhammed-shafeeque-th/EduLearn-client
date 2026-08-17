/* eslint-disable @typescript-eslint/no-explicit-any */
import { config } from '@/lib/config';
import { decode } from 'jsonwebtoken';

const getBaseCookieOptions = (token?: string) => {
  let expiresAtDate: Date | undefined;
  let maxAge: number | undefined;

  if (token) {
    const jwtPayload: any = decode(token);
    if (jwtPayload?.exp) {
      expiresAtDate = new Date(jwtPayload.exp * 1000);
      maxAge = (jwtPayload.exp - jwtPayload.iat) * 1000;
    }
  }

  return {
    expires: expiresAtDate,
    maxAge: maxAge,
    httpOnly: true,
    secure: true, // Required when sameSite is 'none'
    sameSite: 'none',
    domain: config.appBaseDomain, // Shared across api.* and edulearn.*
    path: '/', // Keep path as root so it's sent on all requests
  };
};

export const getAccessTokenOptions = (token?: string) => {
  return getBaseCookieOptions(token);
};

export const getRefreshTokenOptions = (token?: string) => {
  return {
    ...getBaseCookieOptions(token),
    // Optional: /api/v1/auth/refresh
    path: '/',
  };
};
