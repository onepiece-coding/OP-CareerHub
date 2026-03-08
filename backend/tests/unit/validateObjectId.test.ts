import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

beforeEach(() => {
  vi.resetModules();
});
afterEach(() => {
  vi.restoreAllMocks();
});

describe('validateObjectIdParam middleware', () => {
  it('calls next() (no args) when the param is a valid ObjectId', async () => {
    const mod = await import('../../src/middlewares/validateObjectId.js');
    const middleware = (mod.default as any)('id');

    const req: any = { params: { id: '507f1f77bcf86cd799439011' } }; // valid 24-hex
    const res: any = {};
    const next = vi.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('calls next(err) when the param is missing or empty', async () => {
    const mod = await import('../../src/middlewares/validateObjectId.js');
    const middleware = (mod.default as any)('id');

    const req: any = { params: { id: '' } };
    const res: any = {};
    const next = vi.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(Error);
    expect(String(err.message)).toMatch(/Invalid parameter/i);
    // the underlying zod issue message should be present in the generated message
    expect(String(err.message)).toMatch(/Invalid id/i);
    // structured errors should be attached
    expect((err as any).errors).toBeDefined();
  });

  it('calls next(err) when the param is not a valid ObjectId', async () => {
    const mod = await import('../../src/middlewares/validateObjectId.js');
    const middleware = (mod.default as any)('userId');

    const req: any = { params: { userId: 'not-a-valid-id' } };
    const res: any = {};
    const next = vi.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(Error);
    expect(String(err.message)).toMatch(/Invalid parameter/i);
    expect(String(err.message)).toMatch(/Invalid userId/i);
    expect((err as any).errors).toBeDefined();
  });

  it('allows different param names and messages reference the chosen name', async () => {
    const mod = await import('../../src/middlewares/validateObjectId.js');
    const middleware = (mod.default as any)('petId');

    const reqValid: any = { params: { petId: '507f1f77bcf86cd799439011' } };
    const nextValid = vi.fn();
    middleware(reqValid, {}, nextValid);
    expect(nextValid).toHaveBeenCalledWith();

    const reqInvalid: any = { params: { petId: 'x' } };
    const nextInvalid = vi.fn();
    middleware(reqInvalid, {}, nextInvalid);

    expect(nextInvalid).toHaveBeenCalled();
    const err = nextInvalid.mock.calls[0][0];
    expect(String(err.message)).toMatch(/Invalid parameter/);
    expect(String(err.message)).toMatch(/Invalid petId/);
  });
});
