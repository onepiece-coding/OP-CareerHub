import jwt from 'jsonwebtoken';
import { env } from '../env.js';

export type AccessTokenPayload = { id: string; role: string };
export type RefreshTokenPayload = {
  id: string;
  tokenId: string;
  role?: string;
}; // tokenId for server-side lookup

export function signAccessToken(payload: AccessTokenPayload) {
  const secret = env.JWT_SECRET!;
  const expiresIn = env.ACCESS_TOKEN_EXPIRES_IN_SECONDS ?? 60 * 15;
  return jwt.sign(payload, secret, {
    expiresIn: Number(expiresIn),
  });
}

export function verifyAccessToken(token: string) {
  const secret = env.JWT_SECRET!;
  return jwt.verify(token, secret) as AccessTokenPayload;
}

export function signRefreshToken(payload: RefreshTokenPayload) {
  const secret = env.REFRESH_TOKEN_SECRET!;
  const expiresIn = env.REFRESH_TOKEN_EXPIRES_IN_SECONDS ?? 60 * 60 * 24 * 7;
  return jwt.sign(payload, secret, {
    expiresIn: Number(expiresIn),
  });
}

export function verifyRefreshToken(token: string) {
  const secret = env.REFRESH_TOKEN_SECRET!;
  return jwt.verify(token, secret) as RefreshTokenPayload;
}
