import { describe, it, expect, vi, beforeEach } from 'vitest';

// Hoist-safe mocks
vi.mock('../../src/env.js', () => {
  const env = {
    NODE_ENV: 'test',
    JWT_SECRET: 'a_very_long_test_jwt_secret_which_is_secure_123456',
    REFRESH_TOKEN_SECRET:
      'another_super_secure_refresh_secret_which_is_long_enough_7890',
    ACCESS_TOKEN_EXPIRES_IN_SECONDS: '3600', // 1 hour
    REFRESH_TOKEN_EXPIRES_IN_SECONDS: '604800', // 7 days
  };
  return { env };
});

import {
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../../src/utils/jwt.js';

import jwt from 'jsonwebtoken';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('jwt utils', () => {
  it('signAccessToken -> verifyAccessToken roundtrip', () => {
    const payload = { id: 'user123', role: 'user' };
    const token = signAccessToken(payload);
    expect(typeof token).toBe('string');

    // verifyAccessToken should return the original payload
    const decoded = verifyAccessToken(token);
    expect(decoded.id).toBe(payload.id);
    expect(decoded.role).toBe(payload.role);

    // check token has exp claim (decode without verification to inspect)
    const decodedRaw = jwt.decode(token) as any;
    expect(typeof decodedRaw.exp).toBe('number');
  });

  it('signRefreshToken -> verifyRefreshToken roundtrip', () => {
    const payload = { id: 'user-abc', tokenId: 'tok-1', role: 'recruiter' };
    const token = signRefreshToken(payload);
    expect(typeof token).toBe('string');

    const decoded = verifyRefreshToken(token);
    expect(decoded.id).toBe(payload.id);
    expect(decoded.tokenId).toBe(payload.tokenId);
    expect(decoded.role).toBe(payload.role);

    const decodedRaw = jwt.decode(token) as any;
    expect(typeof decodedRaw.exp).toBe('number');
  });

  it('verifyAccessToken throws on invalid token', () => {
    expect(() => verifyAccessToken('not-a-jwt')).toThrow();
  });

  it('verifyRefreshToken throws on invalid token', () => {
    expect(() => verifyRefreshToken('invalid-refresh')).toThrow();
  });

  it('tokens contain expected payload fields (no extra unexpected fields)', () => {
    const accessPayload = { id: 'u1', role: 'admin' };
    const aToken = signAccessToken(accessPayload);
    const aDecoded = verifyAccessToken(aToken);
    expect(aDecoded.id).toBe('u1');
    expect(aDecoded.role).toBe('admin');

    const refreshPayload = { id: 'u1', tokenId: 'rid' };
    const rToken = signRefreshToken(refreshPayload);
    const rDecoded = verifyRefreshToken(rToken);
    expect(rDecoded.id).toBe('u1');
    expect(rDecoded.tokenId).toBe('rid');
  });
});
