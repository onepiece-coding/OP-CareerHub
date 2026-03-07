import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ----------------- Hoist-safe mocks -----------------
// mock env so jwt.verify can read a secret (not actually used by our fake verify)
vi.mock('../../src/env.js', () => {
  return {
    env: {
      JWT_SECRET: 'test_jwt_secret_which_is_long_enough_123456',
    },
  };
});

// jsonwebtoken mock - default behavior can be overridden in tests by mutating the exported object
vi.mock('jsonwebtoken', () => {
  return {
    default: {
      verify: (token: string) => {
        if (token === 'good-token') return { id: 'u1' };
        // default: throw for any other token (simulates invalid token)
        throw new Error('invalid token');
      },
    },
  };
});

// Mock User model. findById should return an object that has "select" chainable method.
vi.mock('../../src/models/User.js', () => {
  return {
    default: {
      findById: vi.fn(),
    },
  };
});
// ----------------- End mocks -----------------

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('auth middleware', () => {
  it('authenticateUser: calls next with 401 when no token present', async () => {
    const mod = await import('../../src/middlewares/auth.js');
    const req: any = { cookies: {} };
    const res: any = {};
    const next = vi.fn();

    await mod.authenticateUser(req, res, next);

    expect(next).toHaveBeenCalled();
    const err = next.mock.calls[0][0];
    expect(String(err.status || err.message)).toMatch(/401|No token provided/i);
  });

  it('authenticateUser: calls next with 401 when jwt.verify throws (invalid token)', async () => {
    // jsonwebtoken mock by default throws for tokens other than 'good-token'
    const mod = await import('../../src/middlewares/auth.js');
    const req: any = { cookies: { access_token: 'bad-token' } };
    const res: any = {};
    const next = vi.fn();

    await mod.authenticateUser(req, res, next);

    expect(next).toHaveBeenCalled();
    const err = next.mock.calls[0][0];
    expect(String(err.status || err.message)).toMatch(/401|Invalid token/i);
  });

  it('authenticateUser: calls next with 404 when user not found', async () => {
    const jwt = (await import('jsonwebtoken')).default;
    // ensure verify returns payload for this test
    jwt.verify = (token: string) => ({ id: 'missing-user' });

    const User = (await import('../../src/models/User.js')).default as any;
    // findById(...).select(...) -> resolves to null to simulate not-found
    User.findById.mockImplementationOnce(() => ({
      select: () => Promise.resolve(null),
    }));

    const mod = await import('../../src/middlewares/auth.js');
    const req: any = { cookies: { access_token: 'good-token' } };
    const res: any = {};
    const next = vi.fn();

    await mod.authenticateUser(req, res, next);

    expect(User.findById).toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
    const err = next.mock.calls[0][0];
    expect(String(err.status || err.message)).toMatch(/404|User not found/i);
  });

  it('authenticateUser: successful verification sets req.user and calls next without error', async () => {
    const jwt = (await import('jsonwebtoken')).default;
    jwt.verify = (token: string) => ({ id: 'u1' });

    const userObj = { _id: 'u1', username: 'alice', role: 'user' };
    const User = (await import('../../src/models/User.js')).default as any;

    // simulate chainable findById(...).select(...) -> resolves to userObj
    User.findById.mockImplementationOnce(() => ({
      select: () => Promise.resolve(userObj),
    }));

    const mod = await import('../../src/middlewares/auth.js');
    const req: any = { cookies: { access_token: 'good-token' } };
    const res: any = {};
    const next = vi.fn();

    await mod.authenticateUser(req, res, next);

    expect(User.findById).toHaveBeenCalledWith('u1');
    expect(next).toHaveBeenCalledWith(); // no args -> success
    expect(req.user).toEqual(userObj);
  });

  it('authorizeRoles: forbids access when role not included', async () => {
    const mod = await import('../../src/middlewares/auth.js');
    const middleware = mod.authorizeRoles('admin', 'recruiter');

    const req: any = { user: { role: 'user' } };
    const res: any = {};
    const next = vi.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    const err = next.mock.calls[0][0];
    expect(String(err.status || err.message)).toMatch(/403|permission/i);
  });

  it('authorizeRoles: allows access when role included', async () => {
    const mod = await import('../../src/middlewares/auth.js');
    const middleware = mod.authorizeRoles('admin', 'user');

    const req: any = { user: { role: 'user' } };
    const res: any = {};
    const next = vi.fn();

    middleware(req, res, next);

    // next called without error
    expect(next).toHaveBeenCalledWith();
  });

  it('authorizeRoles: treats missing role as forbidden', async () => {
    const mod = await import('../../src/middlewares/auth.js');
    const middleware = mod.authorizeRoles('admin');

    const req: any = { user: {} };
    const res: any = {};
    const next = vi.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    const err = next.mock.calls[0][0];
    expect(String(err.status || err.message)).toMatch(/403|permission/i);
  });
});
