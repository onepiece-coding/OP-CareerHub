import { describe, it, beforeEach, expect, vi } from 'vitest';

// mock sendEmail 1st
vi.mock('../../src/utils/sendEmail.js', () => ({ default: vi.fn() }));

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { getAgent } from '../helpers/server.js';
import * as factories from '../helpers/factories.js';

beforeEach(async () => {
  // clear DB collections
  const collections = mongoose.connection.collections;
  for (const k of Object.keys(collections)) {
    // @ts-ignore
    await collections[k].deleteMany({});
  }

  // reset mocks state
  const sendEmail = (await import('../../src/utils/sendEmail.js')).default;
  (sendEmail as any).mockClear();
});

describe('Integration — Password reset flows', () => {
  it('POST /password/reset-password-link -> non-existing email returns 404', async () => {
    const agent = getAgent();
    await agent
      .post('/api/v1/password/reset-password-link')
      .send({ email: 'noone-xxxx@example.test' })
      .expect(404);
  });

  it('POST /password/reset-password-link -> existing user creates/uses token and sendEmail called', async () => {
    const VerificationTokenModel = (
      await import('../../src/models/VerificationToken.js')
    ).default;
    const sendEmail = (await import('../../src/utils/sendEmail.js')).default;

    // create user
    const user = await factories.createUser({
      email: `reset-${Date.now()}@example.test`,
      password: 'Password1!',
      username: 'resetUser',
      isAccountVerified: true,
    });

    const agent = getAgent();
    await agent
      .post('/api/v1/password/reset-password-link')
      .send({ email: user.email })
      .expect(200);

    // verification token should exist in DB for this user
    const vt = await VerificationTokenModel.findOne({ userId: user._id })
      .lean()
      .exec();
    expect(vt).toBeTruthy();
    expect(typeof (vt as any).token).toBe('string');

    // sendEmail should have been called once with a link that includes user._id and the token
    expect((sendEmail as any).mock.calls.length).toBeGreaterThanOrEqual(1);
    const callArg = (sendEmail as any).mock.calls[0][0];
    expect(callArg).toHaveProperty('to', user.email);
    // HTML should include userId and token (controller constructs ${env.CLIENT_DOMAIN}/reset-password/${user._id}/${token})
    expect(String(callArg.html)).toContain(String(user._id));
    expect(String(callArg.html)).toContain(String((vt as any).token));
  });

  it('GET /password/reset-password/:userId/:token -> invalid token or user returns 400, valid returns 200', async () => {
    const VerificationTokenModel = (
      await import('../../src/models/VerificationToken.js')
    ).default;

    // create user & token
    const user = await factories.createUser({
      email: `reset-get-${Date.now()}@example.test`,
      password: 'Password1!',
      username: 'resetGet',
      isAccountVerified: true,
    });

    const vtDoc = await VerificationTokenModel.create({
      userId: user._id,
      token: 'sometesttoken123',
    });

    const agent = getAgent();

    // wrong token => 400
    await agent
      .get(`/api/v1/password/reset-password/${user._id}/invalid-token`)
      .expect(400);

    // wrong user id (valid format but non-existing) => 400 (controller checks user existence)
    const fakeId = '000000000000000000000000';
    await agent
      .get(`/api/v1/password/reset-password/${fakeId}/${vtDoc.token}`)
      .expect(400);

    // correct -> 200
    await agent
      .get(`/api/v1/password/reset-password/${user._id}/${vtDoc.token}`)
      .expect(200);
  });

  it('POST /password/reset-password/:userId/:token -> valid updates password (hashed) and deletes token', async () => {
    const VerificationTokenModel = (
      await import('../../src/models/VerificationToken.js')
    ).default;
    const UserModel = (await import('../../src/models/User.js')).default;

    // create user & token
    const user = await factories.createUser({
      email: `reset-post-${Date.now()}@example.test`,
      password: 'OldPassword1!',
      username: 'resetPost',
      isAccountVerified: false,
    });

    const tokenVal = 'postflowtoken123';
    await VerificationTokenModel.create({
      userId: user._id,
      token: tokenVal,
    });

    const agent = getAgent();

    const newPassword = 'BrandNewPass1!';
    await agent
      .post(`/api/v1/password/reset-password/${user._id}/${tokenVal}`)
      .send({ password: newPassword })
      .expect(200);

    // token removed
    const vtAfter = await VerificationTokenModel.findOne({ userId: user._id })
      .lean()
      .exec();
    expect(vtAfter).toBeNull();

    // user password changed & hashed
    const updated = await UserModel.findById(user._id).lean().exec();
    expect(updated).toBeTruthy();
    // password in DB should not be equal to plaintext
    expect((updated as any).password).not.toBe(newPassword);

    // verify using bcrypt compare
    const matches = await bcrypt.compare(
      newPassword,
      (updated as any).password,
    );
    expect(matches).toBeTruthy();

    // controller sets isAccountVerified true after reset; assert it
    expect((updated as any).isAccountVerified).toBeTruthy();
  });
});
