import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ----------------- Hoist-safe mocks -----------------
vi.mock('../../src/env.js', () => {
  return {
    env: {
      CLIENT_DOMAIN: 'http://localhost:3000',
    },
  };
});

// mock sendEmail
vi.mock('../../src/utils/sendEmail.js', () => {
  return {
    default: vi.fn(),
  };
});

// Mock User model with methods used by controllers
vi.mock('../../src/models/User.js', () => {
  return {
    default: {
      findOne: vi.fn(),
      findById: vi.fn(),
    },
  };
});

// Mock VerificationToken: need both static methods (findOne, deleteOne) and a constructor
vi.mock('../../src/models/VerificationToken.js', () => {
  class MockVerificationToken {
    userId: any;
    token: any;
    _id: any;
    save: any;

    constructor(data?: any) {
      this.userId = data?.userId;
      this.token = data?.token ?? 'generated-token';
      this._id = 'new-vt-id';
      // instance.save mocked to resolve to the instance
      this.save = vi.fn().mockResolvedValue(this);
    }

    // static methods used by the controller
    static findOne = vi.fn();
    static deleteOne = vi.fn();
  }

  return { default: MockVerificationToken };
});
// ----------------- End mocks -----------------

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('password controllers (unit)', () => {
  it('sendResetPasswordLinkCtrl: user not found -> calls next with 404', async () => {
    const User = (await import('../../src/models/User.js')).default as any;
    User.findOne.mockResolvedValueOnce(null);

    const mod = await import('../../src/controllers/passwordController.js');
    const req: any = { body: { email: 'noone@example.com' } };
    const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next = vi.fn();

    await mod.sendResetPasswordLinkCtrl(req, res, next);

    expect(next).toHaveBeenCalled();
    const err = next.mock.calls[0][0];
    expect(String(err.message)).toMatch(/does not exist/i);
  });

  it('sendResetPasswordLinkCtrl: creates token when missing, sends email and returns 200', async () => {
    const User = (await import('../../src/models/User.js')).default as any;
    const VerificationToken = (
      await import('../../src/models/VerificationToken.js')
    ).default as any;
    const sendEmail = (await import('../../src/utils/sendEmail.js'))
      .default as any;

    // user exists, but no existing verification token
    const user = { _id: 'u1', email: 'u1@example.com' };
    User.findOne.mockResolvedValueOnce(user);
    VerificationToken.findOne.mockResolvedValueOnce(null);

    const mod = await import('../../src/controllers/passwordController.js');

    const req: any = { body: { email: 'u1@example.com' } };
    const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next = vi.fn();

    await mod.sendResetPasswordLinkCtrl(req, res, next);

    expect(VerificationToken.findOne).toHaveBeenCalled();
    expect(sendEmail).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    const payload = res.json.mock.calls[0][0];
    expect(payload).toHaveProperty('message');
    expect(String(payload.message)).toMatch(
      /Password reset link has been sent/i,
    );
  });

  it('getResetPasswordLinkCtrl: invalid user -> next called with 400', async () => {
    const User = (await import('../../src/models/User.js')).default as any;
    User.findById.mockResolvedValueOnce(null);

    const mod = await import('../../src/controllers/passwordController.js');
    const req: any = { params: { userId: 'nope', token: 'tok' } };
    const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next = vi.fn();

    await mod.getResetPasswordLinkCtrl(req, res, next);

    expect(next).toHaveBeenCalled();
    const err = next.mock.calls[0][0];
    expect(String(err.message)).toMatch(/Invalid link/i);
  });

  it('getResetPasswordLinkCtrl: invalid token -> next called with 400', async () => {
    const User = (await import('../../src/models/User.js')).default as any;
    const VerificationToken = (
      await import('../../src/models/VerificationToken.js')
    ).default as any;

    const user = { _id: 'u2' };
    User.findById.mockResolvedValueOnce(user);
    VerificationToken.findOne.mockResolvedValueOnce(null);

    const mod = await import('../../src/controllers/passwordController.js');
    const req: any = { params: { userId: 'u2', token: 'wrong' } };
    const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next = vi.fn();

    await mod.getResetPasswordLinkCtrl(req, res, next);

    expect(next).toHaveBeenCalled();
    const err = next.mock.calls[0][0];
    expect(String(err.message)).toMatch(/Invalid link/i);
  });

  it('getResetPasswordLinkCtrl: valid link -> returns 200', async () => {
    const User = (await import('../../src/models/User.js')).default as any;
    const VerificationToken = (
      await import('../../src/models/VerificationToken.js')
    ).default as any;

    const user = { _id: 'u3' };
    User.findById.mockResolvedValueOnce(user);
    VerificationToken.findOne.mockResolvedValueOnce({
      _id: 'vt1',
      token: 'tok',
    });

    const mod = await import('../../src/controllers/passwordController.js');
    const req: any = { params: { userId: 'u3', token: 'tok' } };
    const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next = vi.fn();

    await mod.getResetPasswordLinkCtrl(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Valid url' }),
    );
  });

  it('resetPasswordCtrl: user not found -> next called with 400', async () => {
    const User = (await import('../../src/models/User.js')).default as any;
    User.findById.mockResolvedValueOnce(null);

    const mod = await import('../../src/controllers/passwordController.js');
    const req: any = {
      params: { userId: 'nope', token: 'tok' },
      body: { password: 'newpass' },
    };
    const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next = vi.fn();

    await mod.resetPasswordCtrl(req, res, next);

    expect(next).toHaveBeenCalled();
    const err = next.mock.calls[0][0];
    expect(String(err.message)).toMatch(/Invalid link/i);
  });

  it('resetPasswordCtrl: invalid token -> next called with 400', async () => {
    const User = (await import('../../src/models/User.js')).default as any;
    const VerificationToken = (
      await import('../../src/models/VerificationToken.js')
    ).default as any;

    const user = {
      _id: 'u4',
      isAccountVerified: true,
      save: vi.fn().mockResolvedValue({}),
    };
    User.findById.mockResolvedValueOnce(user);
    VerificationToken.findOne.mockResolvedValueOnce(null);

    const mod = await import('../../src/controllers/passwordController.js');
    const req: any = {
      params: { userId: 'u4', token: 'bad' },
      body: { password: 'newpass' },
    };
    const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next = vi.fn();

    await mod.resetPasswordCtrl(req, res, next);

    expect(next).toHaveBeenCalled();
    const err = next.mock.calls[0][0];
    expect(String(err.message)).toMatch(/Invalid link/i);
  });

  it('resetPasswordCtrl: valid reset -> marks verified if needed, saves user, deletes token and returns 200', async () => {
    const User = (await import('../../src/models/User.js')).default as any;
    const VerificationToken = (
      await import('../../src/models/VerificationToken.js')
    ).default as any;

    // user initially not verified
    const user: any = {
      _id: 'u5',
      isAccountVerified: false,
      save: vi.fn().mockResolvedValue({}),
    };
    User.findById.mockResolvedValueOnce(user);

    // token found
    const vt = { _id: 'vt-ok', token: 'goodtok' };
    VerificationToken.findOne.mockResolvedValueOnce(vt);

    // ensure deleteOne resolves
    VerificationToken.deleteOne.mockResolvedValueOnce({ deletedCount: 1 });

    const mod = await import('../../src/controllers/passwordController.js');
    const req: any = {
      params: { userId: 'u5', token: 'goodtok' },
      body: { password: 'brandnew' },
    };
    const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next = vi.fn();

    await mod.resetPasswordCtrl(req, res, next);

    // user should be marked verified and saved
    expect(user.isAccountVerified).toBe(true);
    expect(user.password).toBe('brandnew');
    expect(user.save).toHaveBeenCalled();

    // VerificationToken.deleteOne should be called with _id
    expect(VerificationToken.deleteOne).toHaveBeenCalledWith({ _id: vt._id });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true }),
    );
  });
});
