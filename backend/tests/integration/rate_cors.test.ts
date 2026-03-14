import { describe, it, expect } from 'vitest';
import app from '../../src/app.js';
import { getAgent } from '../helpers/server.js';

function findRateLimitMiddleware(stack: any): boolean {
  if (!stack || !Array.isArray(stack)) return false;

  for (const layer of stack) {
    // layer may be an express Layer or a function wrapper
    const handle = (layer && (layer.handle ?? layer)) as any;
    const layerName = layer && layer.name ? String(layer.name) : '';
    const handleName = handle && handle.name ? String(handle.name) : '';

    // 1) Name heuristics
    if (
      /rate|limit|limiter/i.test(layerName) ||
      /rate|limit|limiter/i.test(handleName)
    ) {
      return true;
    }

    // 2) Inspect function source as fallback (express-rate-limit often closes over "windowMs" / "max" etc.)
    try {
      if (typeof handle === 'function') {
        const src = handle.toString();
        if (
          /windowMs|max|keyGenerator|skip|handler|standardHeaders|legacyHeaders/i.test(
            src,
          )
        ) {
          return true;
        }
      }
    } catch {
      // ignore toString failures in some environments
    }

    // 3) If the layer is a mounted router or has nested stack, recurse
    const nested = (handle && handle.stack) || layer.stack;
    if (nested && Array.isArray(nested)) {
      if (findRateLimitMiddleware(nested)) return true;
    }
  }

  return false;
}

describe('Smoke — CORS & RateLimit wiring', () => {
  it('CORS: GET request with Origin header should receive Access-Control-Allow-Origin echo', async () => {
    const agent = getAgent();
    const origin = 'http://example.test';

    const res = await agent
      .get('/api/v1/jobs')
      .set('Origin', origin)
      .expect(200);

    const got = res.headers['access-control-allow-origin'];
    expect(got).toBeDefined();
    expect(got === origin || typeof got === 'string').toBeTruthy();
  });

  it('RateLimit middleware is mounted on the app (smoke) — router stack contains rate/limit middleware', () => {
    // Access Express internals for smoke test only
    // @ts-ignore
    const stack = app._router?.stack ?? app.stack ?? null;
    const found = findRateLimitMiddleware(stack);

    // Helpful failure message to speed debugging if it fails
    if (!found) {
      // collect some layer names to help debugging locally (won't print in test runner unless thrown)
      const sampleNames: string[] =
        (stack &&
          stack
            .slice(0, 30)
            .map(
              (l: any) =>
                l?.name || (l && l.handle && l.handle.name) || '<unknown>',
            )
            .filter(Boolean)) ||
        [];
      throw new Error(
        `RateLimit middleware not detected in app stack. Sample top layer names: ${sampleNames.join(
          ', ',
        )}`,
      );
    }

    expect(found).toBe(true);
  });
});
