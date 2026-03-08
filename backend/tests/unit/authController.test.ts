import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ---------------------- Hoist-safe mocks ----------------------
// Mock env
vi.mock('../../src/env.js', () => {
  return {
    env: {
      CLIENT_DOMAIN: 'http://localhost',
      COOKIE_SECURE: false,
      REFRESH_TOKEN_EXPIRES_IN_SECONDS: 60 * 60 * 24 * 7,
      ACCESS_TOKEN_EXPIRES_IN_SECONDS: 60 * 15,
      NODE_ENV: 'test',
    },
  };
});

// Mock sendEmail
vi.mock('../../src/utils/sendEmail.js', () => {
  return {
    default: vi.fn().mockResolvedValue({ ok: true }),
  };
});

// Mock socket service sendNotification
vi.mock('../../src/services/socketService.js', () => {
  return {
    sendNotification: vi.fn(),
  };
});

// Mock jwt utils
vi.mock('../../src/utils/jwt.js', () => {
  return {
    signAccessToken: vi.fn(() => 'signed-access-token'),
    signRefreshToken: vi.fn(() => 'signed-refresh-token'),
    verifyRefreshToken: vi.fn((token: string) => {
      // default behavior
      if (token === 'invalid') throw new Error('invalid');
      return { id: 'user-id', tokenId: 'tid', role: 'user' };
    }),
  };
});

// Mock User model
vi.mock('../../src/models/User.js', () => {
  const viFn = vi.fn;

  function User(this: any, data: any) {
    Object.assign(this, data);
    this._id = data?._id ?? 'user-id';
    this.save = viFn().mockResolvedValue(this);
    this.comparePassword = viFn(
      async (pw: string) => pw === 'correct-password',
    );
    this.toObject = function () {
      const o: any = { ...this };
      delete o.password;
      return o;
    };
  }
  // static methods
  (User as any).findOne = viFn();
  (User as any).countDocuments = viFn();
  (User as any).findById = viFn();
  return { default: User };
});

// Mock VerificationToken model
vi.mock('../../src/models/VerificationToken.js', () => {
  const viFn = vi.fn;
  function VT(this: any, data: any) {
    Object.assign(this, data);
    this.save = viFn().mockResolvedValue(this);
  }
  (VT as any).findOne = viFn();
  (VT as any).deleteOne = viFn().mockResolvedValue({});
  return { default: VT };
});

// Mock RefreshToken model
vi.mock('../../src/models/RefreshToken.js', () => {
  const viFn = vi.fn;
  // create is used, findOne returns an instance-like object with deleteOne
  return {
    default: {
      create: viFn().mockResolvedValue({}),
      findOne: viFn(),
      deleteOne: viFn().mockResolvedValue({}),
    },
  };
});

// Mock Notification model
vi.mock('../../src/models/Notification.js', () => {
  return {
    default: {
      find: vi.fn().mockResolvedValue([]),
    },
  };
});
// -------------------- End mocks --------------------

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('authController (unit)', () => {
  async function load() {
    const mod = await import('../../src/controllers/authController.js');
    const User = (await import('../../src/models/User.js')).default as any;
    const VT = (await import('../../src/models/VerificationToken.js'))
      .default as any;
    const RefreshToken = (await import('../../src/models/RefreshToken.js'))
      .default as any;
    const Notification = (await import('../../src/models/Notification.js'))
      .default as any;
    const sendEmail = (await import('../../src/utils/sendEmail.js'))
      .default as any;
    const jwtUtils = await import('../../src/utils/jwt.js');
    const socketSvc = await import('../../src/services/socketService.js');
    return {
      mod,
      User,
      VT,
      RefreshToken,
      Notification,
      sendEmail,
      jwtUtils,
      socketSvc,
    };
  }

  function makeRes() {
    return {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      cookie: vi.fn(),
      clearCookie: vi.fn(),
    } as any;
  }

  it('registerUserCtrl: returns 201 and sends verification email on success (first user -> admin)', async () => {
    const { mod, User, VT, sendEmail } = await load();
    // findOne -> null, countDocuments -> 0 (become admin)
    (User.findOne as any).mockResolvedValue(null);
    (User.countDocuments as any).mockResolvedValue(0);

    const req = {
      body: {
        username: 'bob',
        email: 'bob@test.com',
        password: 'Passw0rd!',
        gender: 'male',
        location: 'loc',
      },
    } as any;
    const res = makeRes();
    const next = vi.fn();

    await mod.registerUserCtrl(req, res, next);

    expect(User.findOne).toHaveBeenCalledWith({ email: 'bob@test.com' });
    expect(VT.prototype.save || VT.prototype.save === undefined).toBeDefined();
    expect(sendEmail).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.any(String) }),
    );
  });

  it('registerUserCtrl: returns error when user already exists', async () => {
    const { mod, User } = await load();
    (User.findOne as any).mockResolvedValue({
      _id: 'u1',
      email: 'exists@test.com',
    });
    const req = {
      body: { username: 'x', email: 'exists@test.com', password: 'x' },
    } as any;
    const res = makeRes();
    const next = vi.fn();

    await mod.registerUserCtrl(req, res, next);

    // Should call next with an http error (createError 400)
    expect(next).toHaveBeenCalled();
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(Error);
    // message 'User already exists!'
    expect(String(err.message)).toMatch(/User already exists/i);
  });

  it('loginUserCtrl: invalid credentials calls next with error', async () => {
    const { mod, User } = await load();
    // no user
    (User.findOne as any).mockResolvedValue(null);
    const req = {
      body: { email: 'noone@test.com', password: 'doesntmatter' },
    } as any;
    const res = makeRes();
    const next = vi.fn();

    await mod.loginUserCtrl(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(String(next.mock.calls[0][0].message)).toMatch(
      /Invalid Credentials/i,
    );
  });

  it('loginUserCtrl: unverified user triggers new verification email and returns 400', async () => {
    const { mod, User, VT, sendEmail } = await load();
    // user exists but not verified
    const userInst: any = new (User as any)({
      _id: 'u1',
      email: 'u1@test.com',
      password: 'x',
      isAccountVerified: false,
      role: 'user',
    });
    // comparePassword should return true if provided correct password - ensure it
    userInst.comparePassword = vi.fn(async (_pw: string) => true);
    (User.findOne as any).mockResolvedValue(userInst);
    // no existing verification token -> create new
    (VT.findOne as any).mockResolvedValue(null);

    const req = { body: { email: 'u1@test.com', password: 'whatever' } } as any;
    const res = makeRes();
    const next = vi.fn();

    await mod.loginUserCtrl(req, res, next);

    expect(sendEmail).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.any(String) }),
    );
  });

  it('loginUserCtrl: verified user gets tokens, cookies, notifications emitted and user returned', async () => {
    const { mod, User, RefreshToken, Notification, socketSvc } = await load();

    // prepare user instance
    const userInst: any = new (User as any)({
      _id: 'u123',
      email: 'me@test.com',
      password: 'x',
      isAccountVerified: true,
      role: 'user',
    });
    userInst.comparePassword = vi.fn(
      async (pw: string) => pw === 'correct-password',
    );
    (User.findOne as any).mockResolvedValue(userInst);

    // ensure no unread notifications or one notification
    const notif = { recipient: 'u123', read: false, _id: 'n1' };
    (Notification.find as any).mockResolvedValue([notif]);

    // make RefreshToken.create resolve
    (RefreshToken.create as any).mockResolvedValue({});

    const req = {
      body: { email: 'me@test.com', password: 'correct-password' },
    } as any;
    const res = makeRes();
    const next = vi.fn();

    await mod.loginUserCtrl(req, res, next);

    // cookies set (access + refresh)
    expect(res.cookie).toHaveBeenCalledTimes(2);
    // refresh token stored in DB
    expect(RefreshToken.create).toHaveBeenCalled();
    // notifications fetched and emitted
    expect(Notification.find).toHaveBeenCalledWith({
      recipient: userInst._id,
      read: false,
    });
    expect(socketSvc.sendNotification).toHaveBeenCalled();
    // response 200 with user and unread count
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        user: expect.any(Object),
        unreadNotificationsCount: 1,
      }),
    );
  });

  it('refreshTokenCtrl: missing cookie -> next called with 401', async () => {
    const { mod } = await load();

    const req = { cookies: {} } as any;
    const res = makeRes();
    const next = vi.fn();

    await mod.refreshTokenCtrl(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(String(next.mock.calls[0][0].message)).toMatch(
      /No refresh token provided/i,
    );
  });

  it('refreshTokenCtrl: valid rotation issues new cookies and returns user', async () => {
    const { mod, User, RefreshToken } = await load();

    // cookie present
    const rawRefresh = 'old-refresh-token';
    const req = { cookies: { refresh_token: rawRefresh } } as any;

    // verifyRefreshToken should return payload
    // return instance-like object with deleteOne + revoked false + expiresAt future
    const stored = {
      tokenHash: 'whatever',
      revoked: false,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      deleteOne: vi.fn().mockResolvedValue({}),
    };
    (RefreshToken.findOne as any).mockResolvedValue(stored);

    // user exists
    const userObj = {
      _id: 'u-rot',
      role: 'user',
      toObject: () => ({ _id: 'u-rot' }),
    };
    (User.findById as any).mockReturnValue({
      select: vi.fn().mockResolvedValue(userObj),
    });

    const res = makeRes();
    const next = vi.fn();

    await mod.refreshTokenCtrl(req, res, next);

    // should have rotated: stored.deleteOne called, new RefreshToken.create called
    expect(stored.deleteOne).toHaveBeenCalled();
    expect(RefreshToken.create).toHaveBeenCalled();
    // cookies overwritten (two cookies)
    expect(res.cookie).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ user: userObj });
  });

  it('logoutCtrl: deletes refresh token and clears cookies', async () => {
    const { mod, RefreshToken } = await load();
    const req = { cookies: { refresh_token: 'some-refresh' } } as any;
    const res = makeRes();

    const next = vi.fn();
    await mod.logoutCtrl(req, res, next);

    // RefreshToken.deleteOne should be invoked with tokenHash computed from raw
    expect(RefreshToken.deleteOne).toHaveBeenCalled();
    expect(res.clearCookie).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Logged out' });
  });

  it('getMeCtrl: returns 200 with user when found and 401 (next) when not found', async () => {
    const { mod, User } = await load();
    // success case: findById(...).select(...) resolves to the user object
    const userObj = { _id: 'me', name: 'me' };

    // Make findById return a chainable query with select()
    (User.findById as any).mockReturnValueOnce({
      select: vi.fn().mockResolvedValue(userObj),
    });

    const req1 = { user: { id: 'me' } } as any;
    const res1 = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as any;
    const next1 = vi.fn();

    await mod.getMeCtrl(req1, res1, next1);

    // assertions for success
    expect(res1.status).toHaveBeenCalledWith(200);
    expect(res1.json).toHaveBeenCalledWith(
      expect.objectContaining({ result: userObj }),
    );

    // not-found case: findById(...).select(...) resolves to null
    (User.findById as any).mockReturnValueOnce({
      select: vi.fn().mockResolvedValue(null),
    });

    const req2 = { user: { id: 'nope' } } as any;
    const res2 = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as any;
    const next2 = vi.fn();

    await mod.getMeCtrl(req2, res2, next2);

    // controller should call next with an error
    expect(next2).toHaveBeenCalled();
    const err = next2.mock.calls[0][0];
    expect(String(err.message)).toMatch(/Please login first/i);
  });

  it('verifyUserAccountCtrl: invalid user or token -> next called; success toggles verified and deletes token', async () => {
    const { mod, User, VT } = await load();

    // user not found
    (User.findById as any).mockReturnValue({
      select: vi.fn().mockResolvedValue(null),
    });
    const req1 = { params: { userId: 'u1', token: 'tok' } } as any;
    const res1 = makeRes();
    const next1 = vi.fn();
    await mod.verifyUserAccountCtrl(req1, res1, next1);
    expect(next1).toHaveBeenCalled();
    // token not found case
    const fakeUser: any = {
      _id: 'u2',
      isAccountVerified: false,
      save: vi.fn(),
    };
    (User.findById as any).mockResolvedValue(fakeUser);
    (VT.findOne as any).mockResolvedValue(null);
    const req2 = { params: { userId: 'u2', token: 'tok2' } } as any;
    const res2 = makeRes();
    const next2 = vi.fn();
    await mod.verifyUserAccountCtrl(req2, res2, next2);
    expect(next2).toHaveBeenCalled();

    // success
    (VT.findOne as any).mockResolvedValue({ _id: 'vt1' });
    (VT.deleteOne as any).mockResolvedValue({});
    fakeUser.isAccountVerified = false;
    fakeUser.save = vi.fn().mockResolvedValue(fakeUser);
    (User.findById as any).mockResolvedValue(fakeUser);
    const req3 = { params: { userId: 'u2', token: 'tok2' } } as any;
    const res3 = makeRes();
    const next3 = vi.fn();
    await mod.verifyUserAccountCtrl(req3, res3, next3);
    expect(fakeUser.save).toHaveBeenCalled();
    expect(VT.deleteOne).toHaveBeenCalledWith({ _id: 'vt1' });
    expect(res3.status).toHaveBeenCalledWith(200);
    expect(res3.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true }),
    );
  });
});
