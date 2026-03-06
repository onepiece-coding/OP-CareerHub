import logger from './logger.js';
import { env } from '../env.js';

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  from?: string;
};

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

/**
 * Minimal timeout wrapper around fetch.
 * Accepts a fetchFn to allow injection in tests.
 */
async function timeoutFetch(
  input: RequestInfo,
  init: RequestInit = {},
  timeout: number,
  fetchFn: (
    input: RequestInfo,
    init?: RequestInit,
  ) => Promise<Response> = fetch,
): Promise<Response> {
  const ac = new AbortController();
  const id = setTimeout(() => ac.abort(), timeout);

  try {
    // passing the AbortSignal via `signal` so fetch can be aborted.
    const res = await fetchFn(input, { ...init, signal: ac.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

/** Read config at call-time so tests can mutate env dynamically */
function getConfig() {
  return {
    NODE_ENV: env.NODE_ENV,
    BREVO_API_KEY: env.BREVO_API_KEY ?? undefined,
    DEFAULT_FROM: env.FROM_EMAIL ?? env.APP_EMAIL_ADDRESS,
    DEFAULT_TIMEOUT_MS: Number(env.EMAIL_TIMEOUT_MS ?? 10000),
    APP_NAME: env.APP_NAME ?? 'op-careerhub',
  };
}

/**
 * sendEmail
 *
 * Behavior:
 * - If BREVO_API_KEY is set -> use Brevo HTTP API via fetch (or injected fetchFn).
 * - If running tests (NODE_ENV === 'test') and BREVO_API_KEY is not set -> do not attempt network call; return a mocked success object.
 *
 * The optional fetchFn is intended for tests (inject a mock/fake fetch implementation).
 */
export async function sendEmail(
  { to, subject, html, from }: EmailPayload,
  fetchFn?: (input: RequestInfo, init?: RequestInit) => Promise<Response>,
): Promise<any> {
  const cfg = getConfig();

  // Test mode: allow tests to avoid real network calls
  if (cfg.NODE_ENV === 'test' && !cfg.BREVO_API_KEY) {
    logger.info(
      'sendEmail: test env without BREVO_API_KEY — returning mock response',
    );
    return {
      ok: true,
      message: 'Email send mocked in test env',
      to,
      subject,
    };
  }

  if (!cfg.BREVO_API_KEY) {
    // In non-test runtime we require a configured Brevo key
    throw new Error(
      'Email provider not configured. Set BREVO_API_KEY (or run tests with NODE_ENV=test).',
    );
  }

  const payload = {
    sender: {
      email: from ?? cfg.DEFAULT_FROM,
      name: cfg.APP_NAME,
    },
    to: [{ email: to }],
    subject,
    htmlContent: html,
  };

  let res: Response;
  try {
    res = await timeoutFetch(
      BREVO_API_URL,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': cfg.BREVO_API_KEY,
        },
        body: JSON.stringify(payload),
      },
      cfg.DEFAULT_TIMEOUT_MS,
      fetchFn,
    );
  } catch (networkErr: any) {
    const message =
      networkErr?.name === 'AbortError'
        ? 'Request timed out'
        : networkErr?.message;
    logger.error('Brevo network error', { message, stack: networkErr?.stack });
    throw new Error('Internal Server Error (email network)');
  }

  const contentType = res.headers.get('content-type') ?? '';
  let body: any = null;
  if (contentType.includes('application/json')) {
    try {
      body = await res.json();
    } catch {
      body = null;
    }
  } else {
    try {
      body = await res.text();
    } catch {
      body = null;
    }
  }

  if (!res.ok) {
    logger.error('Brevo API error', {
      status: res.status,
      statusText: res.statusText,
      body,
    });
    throw new Error('Internal Server Error (email send)');
  }

  logger.info('Brevo send success', { status: res.status, body });
  return body;
}

export default sendEmail;
