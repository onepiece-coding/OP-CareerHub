import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { z } from 'zod';

beforeEach(() => {
  vi.resetModules();
});
afterEach(() => {
  vi.restoreAllMocks();
});

describe('validate middleware', () => {
  it('validates body schema and merges parsed data into existing req.body object', async () => {
    const mod = await import('../../src/middlewares/validate.js');
    const schema = z.object({
      name: z.string().transform((s) => (s as string).trim()),
      age: z.number().int().optional(),
    });

    const middleware = (mod.validate as any)(schema);

    const req: any = { body: { other: 'x', name: '  alice  ' } };
    const res: any = {};
    const next = vi.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.body.other).toBe('x');
    expect(req.body.name).toBe('alice');
  });

  it('validates specified target (query) when schema given as single schema + target', async () => {
    const mod = await import('../../src/middlewares/validate.js');
    const schema = z
      .string()
      .transform((s) => (s as string).trim())
      .pipe(z.string().min(1));
    const middleware = (mod.validate as any)(schema, 'query');

    // supply req.query as a string (middleware validates the whole part)
    const req: any = { query: '  hello  ' };
    const res: any = {};
    const next = vi.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.query).toBe('hello');
  });

  it('accepts schema map for multiple parts and assigns parsed values', async () => {
    const mod = await import('../../src/middlewares/validate.js');
    const schemaMap = {
      body: z.object({ a: z.string().transform((s) => (s as string).trim()) }),
      params: z.object({
        id: z.string().transform((s) => (s as string).trim()),
      }),
    };
    const middleware = (mod.validate as any)(schemaMap);

    const req: any = { body: { a: '  x  ' }, params: { id: '  123  ' } };
    const res: any = {};
    const next = vi.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.body.a).toBe('x');
    expect(req.params.id).toBe('123');
  });

  it('calls next with 400 and attaches structured errors when validation fails', async () => {
    const mod = await import('../../src/middlewares/validate.js');
    const schema = z.object({ foo: z.string().min(5) });
    const middleware = (mod.validate as any)(schema);

    const req: any = { body: { foo: 'no' } };
    const res: any = {};
    const next = vi.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(Error);
    expect(err.errors).toBeDefined();
    expect(err.errors.body).toBeTruthy();
  });

  it('falls back to replacing req.part when Object.assign throws', async () => {
    const mod = await import('../../src/middlewares/validate.js');
    const schema = z.object({ x: z.number() });
    const middleware = (mod.validate as any)(schema);

    const source = { x: 5 };

    // proxy that throws on Object.assign (used as "existing" on 2nd access)
    const throwingObj = new Proxy(
      {},
      {
        set() {
          throw new Error('assign-throw');
        },
      },
    );

    // Make req.body return source on first access (for parsing),
    // then return throwingObj on second access (for safeAssign existing).
    let calls = 0;
    const req: any = {};
    Object.defineProperty(req, 'body', {
      get() {
        calls += 1;
        return calls === 1 ? source : throwingObj;
      },
      set(v) {
        // allow assignment by replacing the property with a normal value
        Object.defineProperty(req, 'body', {
          value: v,
          writable: true,
          configurable: true,
        });
      },
      configurable: true,
    });

    const res: any = {};
    const next = vi.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.body).toEqual(source);
  });

  it('swallows both assign failures and does not throw (safe guard)', async () => {
    const mod = await import('../../src/middlewares/validate.js');
    const schema = z.object({ y: z.string() });
    const middleware = (mod.validate as any)(schema);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const existingProxy = new Proxy(
      {},
      {
        set() {
          throw new Error('assign-throw');
        },
      },
    );

    // getter returns object with required shape so zod safeParse passes,
    // setter always throws to simulate worst-case
    const goodProxy = new Proxy(
      { y: 'value' },
      {
        set() {
          throw new Error('assign-throw');
        },
      },
    );

    const req: any = {};
    Object.defineProperty(req, 'body', {
      get() {
        return goodProxy;
      },
      set() {
        throw new Error('set-throws');
      },
      configurable: true,
    });

    const res: any = {};
    const next = vi.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
