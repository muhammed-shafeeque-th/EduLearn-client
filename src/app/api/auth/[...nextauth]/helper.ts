/* eslint-disable @typescript-eslint/no-explicit-any */
import { config } from '@/lib/config';
import { decode } from 'jsonwebtoken';

export const getAccessTokenOptions = (token?: string) => {
  let expiresAtDate, maxAge;
  if (token) {
    const jwtPayload: any = decode(token);
    expiresAtDate = new Date(jwtPayload.exp * 1000);
    maxAge = (jwtPayload.exp - jwtPayload.iat) * 1000;
  }

  const cookie = {
    expires: expiresAtDate,
    httpOnly: true || config.environment === 'production',
    maxAge: maxAge,
    sameSite: 'none',
    secure: true,
    path: '/',
  };

  return cookie;
};

export const getRefreshTokenOptions = (token?: string) => {
  let expiresAtDate, maxAge;
  if (token) {
    const jwtPayload: any = decode(token);
    expiresAtDate = new Date(jwtPayload.exp * 1000);
    maxAge = (jwtPayload.exp - jwtPayload.iat) * 1000;
  }

  const cookie = {
    expires: expiresAtDate,
    httpOnly: true || config.environment === 'production',
    maxAge: maxAge,
    sameSite: 'none',
    secure: true,
    // path: '/api/v1/auth',
    path: '/',
  };

  return cookie;
};
