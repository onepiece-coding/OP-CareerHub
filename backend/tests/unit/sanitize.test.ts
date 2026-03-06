import { describe, it, expect } from 'vitest';
import { sanitizeText, sanitizeHtml } from '../../src/utils/sanitize.js';

describe('sanitizeText', () => {
  it('returns non-strings unchanged', () => {
    expect(sanitizeText(123)).toBe(123);
    const obj = { a: 1 };
    expect(sanitizeText(obj)).toBe(obj);
    expect(sanitizeText(null)).toBe(null);
    expect(sanitizeText(undefined)).toBe(undefined);
  });

  it('escapes dangerous tags like <script> but may keep safe inline tags (e.g. <b>)', () => {
    const input = '<script>alert("x")</script><b>bold</b>';
    const out = String(sanitizeText(input));
    // script tags should be escaped/removed (no raw <script)
    expect(out).not.toContain('<script');
    expect(out).not.toContain('</script>');
    // content should remain
    expect(out).toContain('alert("x")');
    // default xss allows some inline tags like <b>, so they may remain — assert presence of content
    expect(out).toContain('bold');
  });

  it('keeps normal text intact except escaping', () => {
    const s = 'Hello & welcome <world>';
    const out = String(sanitizeText(s));
    expect(out).toContain('Hello');
    // ensure angle brackets are encoded/escaped so raw <world> isn't present
    expect(out).not.toContain('<world>');
  });
});

describe('sanitizeHtml', () => {
  it('returns non-strings unchanged', () => {
    expect(sanitizeHtml(42)).toBe(42);
    const obj = { x: 'y' };
    expect(sanitizeHtml(obj)).toBe(obj);
  });

  it('preserves allowed tags and removes disallowed tags like <script>', () => {
    const input =
      '<p>Hello <strong>there</strong> <script>alert(1)</script></p>';
    const out = String(sanitizeHtml(input));
    // allowed tags should remain
    expect(out).toContain('<p');
    expect(out).toContain('<strong');
    // script tag must be removed
    expect(out).not.toContain('<script');
    expect(out).not.toContain('alert(1)');
  });

  it('removes dangerous attributes (onclick, onerror) but keeps safe attrs (href, src)', () => {
    const input = `<a href="https://example.com" onclick="evil()">link</a>
                   <img src="https://example.com/img.png" onerror="evil()" alt="x">`;
    const out = String(sanitizeHtml(input));
    // safe attributes preserved
    expect(out).toContain('href="https://example.com"');
    expect(out).toContain('src="https://example.com/img.png"');
    // dangerous attributes removed
    expect(out).not.toContain('onclick=');
    expect(out).not.toContain('onerror=');
  });

  it('does not convert allowed tags into plain text (keeps markup)', () => {
    const input = '<p><em>italic</em> and <code>code()</code></p>';
    const out = String(sanitizeHtml(input));
    expect(out).toContain('<p');
    expect(out).toContain('<em>');
    expect(out).toContain('<code>');
    expect(out).toContain('italic');
    expect(out).toContain('code()');
  });
});
