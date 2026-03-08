import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('error middlewares', () => {
  it('notFound: forwards an Error with 404 statusCode and originalUrl in the message', async () => {
    const envMod = await import('../../src/env.js');
    envMod.env.NODE_ENV = 'test';

    const mod = await import('../../src/middlewares/error.js');
    const { notFound } = mod;

    const req: any = { originalUrl: '/some/missing/path' };
    const next = vi.fn();

    notFound(req as any, {} as any, next as any);

    expect(next).toHaveBeenCalled();
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(Error);
    expect(String(err.message)).toContain('/some/missing/path');
    expect((err as any).statusCode).toBe(404);
  });

  it('errorHandler: handles Mongoose ValidationError and returns 400 with structured errors and stack in non-production', async () => {
    const envMod = await import('../../src/env.js');
    envMod.env.NODE_ENV = 'development';

    const mod = await import('../../src/middlewares/error.js');
    const { errorHandler } = mod;
    const validationError: any = {
      name: 'ValidationError',
      errors: {
        username: { message: 'Username is required' },
        email: { message: 'Email invalid' },
      },
      stack: 'some-stack-trace',
    };

    const res: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    errorHandler(validationError, {} as any, res as any, vi.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalled();

    const payload = res.json.mock.calls[0][0];
    expect(payload).toHaveProperty('message', 'Validation failed');
    expect(payload).toHaveProperty('errors');
    expect(payload.errors).toHaveProperty('username');
    expect(payload.errors.username).toHaveProperty(
      'message',
      'Username is required',
    );
    expect(payload.errors).toHaveProperty('email');
    expect(payload.errors.email).toHaveProperty('message', 'Email invalid');
    expect(payload).toHaveProperty('stack', 'some-stack-trace');
  });

  it('errorHandler: uses provided statusCode and includes err.errors for non-validation errors; hides stack in production', async () => {
    const envMod = await import('../../src/env.js');
    envMod.env.NODE_ENV = 'production';

    const mod = await import('../../src/middlewares/error.js');
    const { errorHandler } = mod;

    const err: any = {
      statusCode: 403,
      message: 'Forbidden action',
      errors: { detail: 'Not allowed' },
      stack: 'should-not-be-included',
    };

    const res: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    errorHandler(err, {} as any, res as any, vi.fn());

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalled();
    const payload = res.json.mock.calls[0][0];
    expect(payload).toHaveProperty('message', 'Forbidden action');
    expect(payload).toHaveProperty('errors');
    expect(payload.errors).toEqual(err.errors);
    expect(payload).not.toHaveProperty('stack');
  });

  it('errorHandler: falls back to 500 and "Internal Server Error" when no message/status provided and includes stack in non-production', async () => {
    const envMod = await import('../../src/env.js');
    envMod.env.NODE_ENV = 'development';

    const mod = await import('../../src/middlewares/error.js');
    const { errorHandler } = mod;

    const err: any = {
      stack: 'dev-stack',
    };

    const res: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    errorHandler(err, {} as any, res as any, vi.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalled();
    const payload = res.json.mock.calls[0][0];
    expect(payload).toHaveProperty('message', 'Internal Server Error');
    expect(payload).toHaveProperty('stack', 'dev-stack');
  });
});
