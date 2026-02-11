import jwt, { JwtPayload } from 'jsonwebtoken';
import { config } from '@/lib/config';

/**
 * Verifies a JWT access token and returns its payload.
 * @param token - The JWT access token.
 * @param secret - Secret key for verification. Defaults to config.jwtSecret.
 * @returns The decoded payload if valid, otherwise null.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function verifyAccessToken<T = any>(
  token: string,
  secret: string = config.jwtSecret ?? ''
): T | null {
  if (!secret) {
    throw new Error('JWT secret is not defined');
  }
  try {
    const payload = jwt.verify(token, secret) as JwtPayload | string;
    if (typeof payload === 'object' && payload !== null) {
      return payload as T;
    }
    // In case the payload is a string (unlikely if you use proper JWT structure)
    return null;
  } catch (err) {
    console.error(err);
    return null;
  }
}
