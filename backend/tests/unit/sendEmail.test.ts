import { describe, it, beforeEach, expect, vi } from 'vitest';

// hoist-safe mocks
vi.mock('../../src/utils/logger.js', () => {
  return {
    default: {
      info: vi.fn(),
      error: vi.fn(),
    },
  };
});

vi.mock('../../src/env.js', () => {
  return {
    // Provide a mutable env object that matches the shape used by sendEmail.getConfig()
    env: {
      NODE_ENV: 'test',
      BREVO_API_KEY: undefined,
      FROM_EMAIL: 'from@test.com',
      APP_EMAIL_ADDRESS: 'app@test.com',
      EMAIL_TIMEOUT_MS: '10000',
      APP_NAME: 'op-careerhub',
    },
  };
});

// import the modules under test (after mocks are registered)
import logger from '../../src/utils/logger.js';
import { env } from '../../src/env.js';
import { sendEmail } from '../../src/utils/sendEmail.js';

describe('sendEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // reset env to sensible defaults for each test
    env.NODE_ENV = 'test';
    env.BREVO_API_KEY = undefined;
    env.FROM_EMAIL = 'from@test.com';
    env.APP_EMAIL_ADDRESS = 'app@test.com';
    env.EMAIL_TIMEOUT_MS = 10000;
    env.APP_NAME = 'op-careerhub';
  });

  it('returns mocked response in test env when BREVO_API_KEY is missing', async () => {
    env.NODE_ENV = 'test';
    env.BREVO_API_KEY = undefined;

    const result = await sendEmail({
      to: 'user@test.com',
      subject: 'hello',
      html: '<p>test</p>',
    });

    expect(result).toBeTruthy();
    expect(result.ok).toBe(true);
    expect(result.to).toBe('user@test.com');
    expect((logger as any).info).toHaveBeenCalled();
  });

  it('throws when BREVO_API_KEY missing outside test env', async () => {
    env.NODE_ENV = 'production';
    env.BREVO_API_KEY = undefined;

    await expect(
      sendEmail({
        to: 'user@test.com',
        subject: 'hello',
        html: '<p>test</p>',
      }),
    ).rejects.toThrow('Email provider not configured');
  });

  it('sends request using fetchFn and returns JSON body on success', async () => {
    env.NODE_ENV = 'production';
    env.BREVO_API_KEY = 'fake-key';

    const fakeFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => ({ messageId: '123' }),
    } as any);

    const res = await sendEmail(
      {
        to: 'user@test.com',
        subject: 'hello',
        html: '<p>test</p>',
      },
      fakeFetch,
    );

    expect(fakeFetch).toHaveBeenCalled();
    expect(res.messageId).toBe('123');
    expect((logger as any).info).toHaveBeenCalled();
  });

  it('parses text response if content-type not json', async () => {
    env.NODE_ENV = 'production';
    env.BREVO_API_KEY = 'fake-key';

    const fakeFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'text/plain' },
      text: async () => 'ok',
    } as any);

    const res = await sendEmail(
      {
        to: 'user@test.com',
        subject: 'hello',
        html: '<p>test</p>',
      },
      fakeFetch,
    );

    expect(res).toBe('ok');
  });

  it('throws when Brevo API responds with error status', async () => {
    env.NODE_ENV = 'production';
    env.BREVO_API_KEY = 'fake-key';

    const fakeFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      headers: { get: () => 'application/json' },
      json: async () => ({ error: 'bad request' }),
    } as any);

    await expect(
      sendEmail(
        {
          to: 'user@test.com',
          subject: 'hello',
          html: '<p>test</p>',
        },
        fakeFetch,
      ),
    ).rejects.toThrow('Internal Server Error (email send)');

    expect((logger as any).error).toHaveBeenCalled();
  });

  it('handles network errors and logs them', async () => {
    env.NODE_ENV = 'production';
    env.BREVO_API_KEY = 'fake-key';

    const fakeFetch = vi.fn().mockRejectedValue(new Error('network'));

    await expect(
      sendEmail(
        {
          to: 'user@test.com',
          subject: 'hello',
          html: '<p>test</p>',
        },
        fakeFetch,
      ),
    ).rejects.toThrow('Internal Server Error (email network)');

    expect((logger as any).error).toHaveBeenCalled();
  });
});
