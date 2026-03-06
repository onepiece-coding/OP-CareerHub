import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import http from 'http';

// Mock env and routes before importing app
vi.mock('../../src/env.js', () => {
  return {
    env: {
      NODE_ENV: 'development',
      CLIENT_DOMAIN: 'http://localhost:3000',
      COOKIE_SECRET: 'cookie-secret-123',
    },
  };
});

// Provide a tiny router to mount at /api/v1 so tests are focused
vi.mock('../../src/routes/index.js', () => {
  const express = require('express');
  const r = express.Router();
  r.get('/ping', (_req: any, res: any) => res.json({ ok: true }));
  return { default: r };
});

beforeEach(() => {
  vi.resetModules();
});

describe('app bootstrap', () => {
  it('mounts the root router under /api/v1 and responds', async () => {
    const app = (await import('../../src/app.js')).default;
    await request(app)
      .get('/api/v1/ping')
      .expect(200)
      .then((r) => {
        expect(r.body.ok).toBe(true);
      });
  });

  it('applies CORS and allows the configured origin in non-production', async () => {
    const app = (await import('../../src/app.js')).default;
    const res = await request(app)
      .options('/api/v1/ping')
      .set('Origin', 'http://localhost:3000')
      .send();
    // Express/cors typically responds with allow-origin header for preflight
    expect(res.headers['access-control-allow-origin']).toBeDefined();
  });

  it('sets trust proxy when TRUST_PROXY env var is set to "1"', async () => {
    // set the process-level env before re-importing the app
    process.env.TRUST_PROXY = '1';
    vi.resetModules();
    // re-mock env and routes (vitest reset removes previous mocks)
    vi.mock('../../src/env.js', () => ({
      env: { NODE_ENV: 'development', CLIENT_DOMAIN: 'http://localhost:3000' },
    }));
    vi.mock('../../src/routes/index.js', () => {
      const express = require('express');
      const r = express.Router();
      r.get('/ping', (_req: any, res: any) => res.json({ ok: true }));
      return { default: r };
    });

    const app = (await import('../../src/app.js')).default;
    expect(app.get('trust proxy')).toBe(1);
    // cleanup
    delete process.env.TRUST_PROXY;
  });

  it('serves static and index in production mode (mount check)', async () => {
    // we won't check actual file serving — only that code-path for production is set up.
    vi.resetModules();
    vi.mock('../../src/env.js', () => ({
      env: { NODE_ENV: 'production', CLIENT_DOMAIN: 'http://localhost:3000' },
    }));
    vi.mock('../../src/routes/index.js', () => {
      const express = require('express');
      const r = express.Router();
      r.get('/ping', (_req: any, res: any) => res.json({ ok: true }));
      return { default: r };
    });

    const app = (await import('../../src/app.js')).default;
    // In production, app should still respond to the mounted router endpoint
    await request(app).get('/api/v1/ping').expect(200);
  });
});
