import { describe, it, expect, beforeEach, vi } from 'vitest';
import mongoose from 'mongoose';
import { getAgent } from '../helpers/server.js';
import * as factories from '../helpers/factories.js';

beforeEach(async () => {
  vi.resetAllMocks();
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    // @ts-ignore
    await collections[key].deleteMany({});
  }
});

describe('Integration — Protected routes & middleware', () => {
  it('GET /api/v1/auth/me -> 401 when no cookie provided', async () => {
    const agent = getAgent();
    await agent.get('/api/v1/auth/me').expect(401);
  });

  it('GET /api/v1/auth/me -> 401 when access_token invalid', async () => {
    const agent = getAgent();
    await agent
      .get('/api/v1/auth/me')
      .set('Cookie', 'access_token=some-bad-token')
      .expect(401);
  });

  it('GET /api/v1/auth/me -> 200 and returns user without password when cookie valid', async () => {
    const email = `me-${Date.now()}@example.test`;
    const password = 'Password1!';
    const user = await factories.createUser({
      email,
      password,
      isAccountVerified: true,
    });

    const agent = getAgent();
    // capture login response (Set-Cookie)
    const loginRes = await agent
      .post('/api/v1/auth/login')
      .send({ email, password })
      .expect(200);

    const setCookie = (loginRes.headers['set-cookie'] || []) as string[];
    expect(setCookie.length).toBeGreaterThanOrEqual(1);

    const res = await agent
      .get('/api/v1/auth/me')
      .set('Cookie', setCookie)
      .expect(200);

    expect(res.body).toHaveProperty('result');
    const me = res.body.result;
    expect(me).toHaveProperty('_id', String(user._id));
    expect(me).not.toHaveProperty('password');
  });

  it('authorizeRoles: user role gets 403 on admin-only route', async () => {
    const email = `user-${Date.now()}@example.test`;
    const password = 'Password1!';
    await factories.createUser({
      email,
      password,
      role: 'user',
      isAccountVerified: true,
    });

    const agent = getAgent();
    const loginRes = await agent
      .post('/api/v1/auth/login')
      .send({ email, password })
      .expect(200);

    const setCookie = (loginRes.headers['set-cookie'] || []) as string[];
    await agent.get('/api/v1/admin/info').set('Cookie', setCookie).expect(403);
  });

  it('authorizeRoles: admin role permitted on admin-only route', async () => {
    const email = `admin-${Date.now()}@example.test`;
    const password = 'Password1!';
    await factories.createUser({
      email,
      password,
      role: 'admin',
      isAccountVerified: true,
    });

    const agent = getAgent();
    const loginRes = await agent
      .post('/api/v1/auth/login')
      .send({ email, password })
      .expect(200);

    const setCookie = (loginRes.headers['set-cookie'] || []) as string[];
    const res = await agent
      .get('/api/v1/admin/info')
      .set('Cookie', setCookie)
      .expect(200);

    expect(res.body).toHaveProperty('users');
    expect(res.body).toHaveProperty('jobs');
  });
});
