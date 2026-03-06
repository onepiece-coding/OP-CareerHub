import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { formatZodError } from '../../src/utils/zodHelper.js';

describe('formatZodError', () => {
  it('formats ZodError issues to { path, message } items', () => {
    const schema = z.object({
      name: z.string().min(1, 'name required'),
      age: z.number().int().positive('must be positive'),
    });

    const result = schema.safeParse({ name: '', age: -1 });

    // runtime guard so TS knows `result.error` exists below
    if (result.success) {
      throw new Error('Expected parse to fail for invalid input');
    }

    const formatted = formatZodError(result.error);

    expect(Array.isArray(formatted)).toBe(true);
    const paths = formatted.map((i) => i.path);
    const messages = formatted.map((i) => i.message);

    expect(paths).toContain('name');
    expect(paths).toContain('age');

    expect(messages.some((m) => /name required/.test(String(m)))).toBe(true);
    expect(messages.some((m) => /must be positive/.test(String(m)))).toBe(true);
  });

  it('uses "(root)" for root-level issues', () => {
    const schema = z.object({ a: z.string() });
    const result = schema.safeParse('not-an-object');

    if (result.success) {
      throw new Error('Expected parse to fail for non-object input');
    }

    const formatted = formatZodError(result.error);
    expect(formatted.some((it) => it.path === '(root)')).toBe(true);
  });
});
