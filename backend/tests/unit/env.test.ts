import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

let originalEnv: NodeJS.ProcessEnv;

beforeEach(() => {
  // ensure fresh module evaluation per test
  vi.resetModules();

  // backup the real environment so we can restore later
  originalEnv = { ...process.env };
});

afterEach(() => {
  // restore env to original state after each test
  process.env = { ...originalEnv };
  vi.restoreAllMocks();
});

describe('env module', () => {
  it('parses environment in test mode when JWT/REFRESH secrets provided', async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'x'.repeat(32);
    process.env.REFRESH_TOKEN_SECRET = 'y'.repeat(32);

    const mod = await import('../../src/env.js');
    const { env } = mod as any;

    expect(env.NODE_ENV).toBe('test');
    expect(typeof env.JWT_SECRET).toBe('string');
    expect(env.JWT_SECRET.length).toBeGreaterThanOrEqual(32);
  });

  it('throws when running in production and required runtime vars are missing', async () => {
    // Set to production mode
    process.env.NODE_ENV = 'production';

    // Keep JWT secrets (the refine expects them too) OR you can omit them —
    // the refine requires multiple things; we ensure some required items are missing.
    process.env.JWT_SECRET = 'x'.repeat(32);
    process.env.REFRESH_TOKEN_SECRET = 'y'.repeat(32);

    // Explicitly remove the vars that make the refine pass on real machines
    delete process.env.MONGO_URI;
    delete process.env.CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_API_KEY;
    delete process.env.CLOUDINARY_API_SECRET;
    delete process.env.FROM_EMAIL;
    delete process.env.BREVO_API_KEY;
    // (If your CI has other env keys that could satisfy the refine, delete those too.)

    // importing the module should fail validation and reject
    await expect(import('../../src/env.js')).rejects.toThrow(
      /Invalid environment variables/,
    );
  });

  it('succeeds in production when all required vars are present', async () => {
    process.env.NODE_ENV = 'production';
    process.env.JWT_SECRET = 'x'.repeat(32);
    process.env.REFRESH_TOKEN_SECRET = 'y'.repeat(32);
    process.env.MONGO_URI = 'mongodb://localhost:27017/testdb';
    process.env.CLOUDINARY_CLOUD_NAME = 'cloud';
    process.env.CLOUDINARY_API_KEY = 'key';
    process.env.CLOUDINARY_API_SECRET = 'secret';
    process.env.FROM_EMAIL = 'noreply@example.com';
    process.env.BREVO_API_KEY = 'brevo-key';

    const mod = await import('../../src/env.js');
    const { env } = mod as any;
    expect(env.NODE_ENV).toBe('production');
    expect(env.MONGO_URI).toBeDefined();
  });
});
