import { describe, it, beforeEach, expect, vi } from 'vitest';

// vi.mock is hoisted; create the mocked fn(s) inside the factory
vi.mock('../../src/utils/logger', () => {
  return {
    default: {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
    },
  };
});

// Import module under test after mocking
import connectToDB from '../../src/config/connectToDb.js';
import logger from '../../src/utils/logger.js';

describe('connectToDB', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns early (no connect) when no URI and NODE_ENV === "test"', async () => {
    const fakeClient = { connect: vi.fn() };
    const usedEnv = { NODE_ENV: 'test' };

    const res = await connectToDB(undefined, {
      env: usedEnv as any,
      mongooseClient: fakeClient as any,
    });
    expect(res).toBeUndefined();
    expect((fakeClient.connect as any).mock.calls.length).toBe(0);
    expect((logger as any).info).not.toHaveBeenCalled();
  });

  it('throws when no URI and NODE_ENV !== "test"', async () => {
    const usedEnv = { NODE_ENV: 'production' };
    await expect(
      connectToDB(undefined, { env: usedEnv as any }),
    ).rejects.toThrow('Missing MONGO_URI');
  });

  it('calls client.connect with provided uri argument and logs success', async () => {
    const fakeClient = { connect: vi.fn().mockResolvedValueOnce(undefined) };
    const uri = 'mongodb://localhost:27017/from-arg';
    await connectToDB(uri, {
      mongooseClient: fakeClient as any,
      env: { NODE_ENV: 'production' } as any,
    });

    expect(fakeClient.connect).toHaveBeenCalledTimes(1);
    expect(fakeClient.connect).toHaveBeenCalledWith(uri);
    expect((logger as any).info).toHaveBeenCalledWith('MongoDB connected');
  });

  it('uses options.env.MONGO_URI when uri arg omitted', async () => {
    const fakeClient = { connect: vi.fn().mockResolvedValueOnce(undefined) };
    const envObj = {
      NODE_ENV: 'production',
      MONGO_URI: 'mongodb://env-uri:27017/db',
    };
    await connectToDB(undefined, {
      mongooseClient: fakeClient as any,
      env: envObj as any,
    });

    expect(fakeClient.connect).toHaveBeenCalledTimes(1);
    expect(fakeClient.connect).toHaveBeenCalledWith(envObj.MONGO_URI);
    expect((logger as any).info).toHaveBeenCalledWith('MongoDB connected');
  });

  it('logs error and rethrows when client.connect fails', async () => {
    const boom = new Error('boom');
    const fakeClient = { connect: vi.fn().mockRejectedValueOnce(boom) };
    const uri = 'mongodb://bad:27017';

    await expect(
      connectToDB(uri, {
        mongooseClient: fakeClient as any,
        env: { NODE_ENV: 'production' } as any,
      }),
    ).rejects.toBe(boom);

    // assert logger.error was called and its first argument contains expected text
    expect((logger as any).error).toHaveBeenCalled();
    const calls = (logger as any).error.mock?.calls ?? [];
    expect(calls.length).toBeGreaterThan(0);
    const firstArg = calls[0][0];
    expect(String(firstArg)).toContain('Error connecting to MongoDB');
  });
});
