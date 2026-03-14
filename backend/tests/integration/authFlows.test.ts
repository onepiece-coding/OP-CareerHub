import { describe, it, expect, beforeEach, vi } from 'vitest';

// hoist-safe Vitest mocks
vi.mock('../../src/utils/sendEmail.js', () => ({ default: vi.fn() }));
vi.mock('../../src/services/socketService.js', () => ({
  sendNotification: vi.fn(),
}));

import mongoose from 'mongoose';
import { randomBytes, createHash } from 'crypto';
import { signRefreshToken } from '../../src/utils/jwt.js';
import { getAgent } from '../helpers/server.js';

import UserModel from '../../src/models/User.js';
import VerificationTokenModel from '../../src/models/VerificationToken.js';
import RefreshTokenModel from '../../src/models/RefreshToken.js';
import NotificationModel from '../../src/models/Notification.js';

import sendEmail from '../../src/utils/sendEmail.js';
import { sendNotification } from '../../src/services/socketService.js';

beforeEach(async () => {
  vi.resetAllMocks();
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    // @ts-ignore
    await collections[key].deleteMany({});
  }
});

describe('Integration — Auth flows', () => {
  it('A - Register -> creates user, verification token and sends email', async () => {
    const agent = getAgent();

    const payload = {
      username: 'intreg-user',
      email: `intreg-${Date.now()}@example.test`,
      password: 'Password1!',
    };

    const res = await agent
      .post('/api/v1/auth/register')
      .send(payload)
      .expect(201);
    expect(res.body).toHaveProperty('message');

    const user = await UserModel.findOne({ email: payload.email }).exec();
    expect(user).toBeTruthy();

    const vt = await VerificationTokenModel.findOne({
      userId: user!._id,
    }).exec();
    expect(vt).toBeTruthy();
    expect(typeof (vt as any).token).toBe('string');

    expect(sendEmail as any).toHaveBeenCalled();
    const callArg = (sendEmail as any).mock.calls[0][0];
    expect(callArg).toHaveProperty('to', payload.email);
    expect(String(callArg.html)).toContain((vt as any).token);
  });

  it('A-EDGE - Register same email returns 400', async () => {
    const email = `dup-${Date.now()}@example.test`;
    const u = new UserModel({ username: 'dup', email, password: 'Password1!' });
    await u.save();

    const agent = getAgent();
    await agent
      .post('/api/v1/auth/register')
      .send({ username: 'dup2', email, password: 'Password1!' })
      .expect(400);
  });

  it('B - Verify user account via link sets isAccountVerified and deletes token', async () => {
    const user = new UserModel({
      username: 'verify-me',
      email: `verify-${Date.now()}@example.test`,
      password: 'Password1!',
      isAccountVerified: false,
    });
    await user.save();

    const tokenVal = randomBytes(16).toString('hex');
    const vt = new VerificationTokenModel({
      userId: user._id,
      token: tokenVal,
    });
    await vt.save();

    const agent = getAgent();
    const res = await agent
      .get(`/api/v1/auth/${user._id}/verify/${tokenVal}`)
      .expect(200);
    expect(res.body).toHaveProperty('success', true);

    const updatedUser = await UserModel.findById(user._id).exec();
    expect(updatedUser).toBeTruthy();
    expect(updatedUser!.isAccountVerified).toBe(true);

    const vtAfter = await VerificationTokenModel.findOne({
      userId: user._id,
      token: tokenVal,
    }).exec();
    expect(vtAfter).toBeNull();
  });

  it('C - Login: unverified user triggers new verification email and returns 400', async () => {
    (sendEmail as any).mockClear();

    const email = `unverified-${Date.now()}@example.test`;
    const user = new UserModel({
      username: 'unv',
      email,
      password: 'Password1!',
      isAccountVerified: false,
    });
    await user.save();

    await VerificationTokenModel.deleteMany({ userId: user._id });

    const agent = getAgent();
    const res = await agent
      .post('/api/v1/auth/login')
      .send({ email, password: 'Password1!' })
      .expect(400);
    expect(res.body).toHaveProperty('message');

    expect(sendEmail as any).toHaveBeenCalled();

    const vt = await VerificationTokenModel.findOne({
      userId: user._id,
    }).exec();
    expect(vt).toBeTruthy();
  });

  it('D - Login: verified user gets cookies, unread count and notifications emitted, refreshToken stored', async () => {
    (sendNotification as any).mockClear();

    const email = `verified-${Date.now()}@example.test`;
    const user = new UserModel({
      username: 'ver',
      email,
      password: 'Password1!',
      isAccountVerified: true,
    });
    await user.save();

    // pick a valid enum value for Notification.type (fallback to 'system' if schema absent)
    const enumValues = (NotificationModel.schema.path('type') as any)
      ?.enumValues ?? ['system'];
    const validType = enumValues.length ? enumValues[0] : 'system';

    const notifications = [];
    for (let i = 0; i < 3; i++) {
      notifications.push(
        await NotificationModel.create({
          recipient: user._id,
          read: false,
          message: `n${i}`,
          type: validType,
        }),
      );
    }

    const agent = getAgent();
    const res = await agent
      .post('/api/v1/auth/login')
      .send({ email, password: 'Password1!' })
      .expect(200);

    const setCookie = (res.headers['set-cookie'] || []) as string[];
    expect(setCookie.length).toBeGreaterThanOrEqual(2);
    const cookieStr = setCookie.join('; ');
    expect(cookieStr).toContain('access_token');
    expect(cookieStr).toContain('refresh_token');

    expect(res.body).toHaveProperty(
      'unreadNotificationsCount',
      notifications.length,
    );

    const rtCount = await RefreshTokenModel.countDocuments({
      userId: user._id,
    });
    expect(rtCount).toBeGreaterThanOrEqual(1);

    expect(sendNotification as any).toHaveBeenCalled();
    expect((sendNotification as any).mock.calls.length).toBe(
      notifications.length,
    );
  });

  it('E - Refresh token rotation: accepts refresh cookie, rotates and issues new cookies', async () => {
    const email = `refresh-${Date.now()}@example.test`;
    const user = new UserModel({
      username: 'ref',
      email,
      password: 'Password1!',
      isAccountVerified: true,
    });
    await user.save();

    const tokenId = randomBytes(8).toString('hex');
    const rawRefreshJwt = signRefreshToken({
      id: user._id.toString(),
      tokenId,
      role: user.role,
    });
    const tokenHash = createHash('sha256').update(rawRefreshJwt).digest('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
    await RefreshTokenModel.create({
      userId: user._id,
      tokenHash,
      expiresAt,
      revoked: false,
    });

    const agent = getAgent();
    const res = await agent
      .post('/api/v1/auth/refresh')
      .set('Cookie', `refresh_token=${rawRefreshJwt}`)
      .expect(200);

    expect(res.body).toHaveProperty('user');

    const allTokens = await RefreshTokenModel.find({ userId: user._id }).exec();
    expect(allTokens.length).toBeGreaterThanOrEqual(1);
    const hashes = allTokens.map((t) => (t as any).tokenHash);
    expect(hashes).not.toContain(tokenHash);

    const setCookie = (res.headers['set-cookie'] || []) as string[];
    expect(setCookie.length).toBeGreaterThanOrEqual(2);
    const cookieStr = setCookie.join('; ');
    expect(cookieStr).toContain('access_token');
    expect(cookieStr).toContain('refresh_token');
  });

  it('F - Logout clears refresh token from DB and clears cookies', async () => {
    const factories = await import('../helpers/factories.js');
    const RefreshTokenModel = (await import('../../src/models/RefreshToken.js'))
      .default;

    const email = `logout${Date.now()}@example.test`;
    const password = 'Password1!';

    const user = await factories.createUser({
      email,
      password,
      isAccountVerified: true,
    });

    const agent = getAgent();
    const loginRes = await agent
      .post('/api/v1/auth/login')
      .send({ email, password })
      .expect(200);

    const stored = await RefreshTokenModel.findOne({ userId: user._id }).exec();
    expect(stored).toBeTruthy();

    // explicitly include cookies returned by login in logout request
    const cookies = (loginRes.headers['set-cookie'] || []) as string[];
    const res = await agent
      .post('/api/v1/auth/logout')
      .set('Cookie', cookies)
      .expect(200);

    const found = await RefreshTokenModel.findOne({ _id: stored!._id }).exec();
    expect(found).toBeNull();

    const setCookie = (res.headers['set-cookie'] || []) as string[];
    expect(setCookie.length).toBeGreaterThanOrEqual(1);
    const joined = setCookie.join('; ').toLowerCase();
    expect(
      joined.includes('refresh_token=') || joined.includes('access_token='),
    ).toBeTruthy();
  });
});
