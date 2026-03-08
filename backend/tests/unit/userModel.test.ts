import { beforeAll, afterAll, beforeEach, describe, it, expect } from 'vitest';
import { connectTestDB, clearTestDB, closeTestDB } from '../test-mongo.js';

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

beforeEach(async () => {
  await clearTestDB();
});

describe('User model', () => {
  it('hashes password before save and comparePassword works', async () => {
    const User = (await import('../../src/models/User.js')).default as any;
    const plain = 'S3cret!Pwd';
    const u = new User({
      username: 'alice',
      email: 'alice@example.com',
      password: plain,
    });

    await u.save();

    expect(u.password).not.toBe(plain);
    const ok = await u.comparePassword(plain);
    expect(ok).toBe(true);

    const bad = await u.comparePassword('wrongpass');
    expect(bad).toBe(false);
  });

  it("doesn't re-hash when password not modified", async () => {
    const User = (await import('../../src/models/User.js')).default as any;
    const plain = 'Another!123';
    const u = new User({
      username: 'bob',
      email: 'bob@example.com',
      password: plain,
      location: 'here',
    });

    await u.save();
    const firstHash = u.password;

    u.location = 'there';
    await u.save();
    expect(u.password).toBe(firstHash);
    expect(await u.comparePassword(plain)).toBe(true);
  });
});
