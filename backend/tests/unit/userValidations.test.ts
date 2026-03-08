import { describe, it, expect } from 'vitest';
import {
  passwordSchema,
  validateRegisterUser,
  validateLoginUser,
  validateEmail,
  validateNewPassword,
  validateUpdateUser,
} from '../../src/validations/userValidations.js';

describe('userValidations (unit)', () => {
  it('passwordSchema: accepts a valid password', () => {
    const result = passwordSchema.safeParse('Abcd1234!');
    expect(result.success).toBe(true);
  });

  it('passwordSchema: rejects short / missing rules', () => {
    // too short
    expect(passwordSchema.safeParse('A1!a').success).toBe(false);

    // missing uppercase
    expect(passwordSchema.safeParse('abcd1234!').success).toBe(false);

    // missing number
    expect(passwordSchema.safeParse('Abcdefgh!').success).toBe(false);

    // missing special
    expect(passwordSchema.safeParse('Abcd12345').success).toBe(false);

    // contains space
    expect(passwordSchema.safeParse('Abcd 1234!').success).toBe(false);
  });

  it('validateRegisterUser: accepts valid payload (including optional fields)', () => {
    const dto = {
      username: 'alice',
      email: 'alice@example.com',
      password: 'Secret123!',
      location: 'Country, City, Street',
      gender: 'female',
    };
    const parsed = validateRegisterUser.safeParse(dto);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.username).toBe('alice');
      expect(parsed.data.gender).toBe('female');
    }
  });

  it('validateRegisterUser: rejects invalid email or short username', () => {
    const r1 = validateRegisterUser.safeParse({
      username: 'a',
      email: 'not-an-email',
      password: 'Secret123!',
    });
    expect(r1.success).toBe(false);

    const issues = (r1 as any).error?.issues ?? [];
    // verify at least one issue exists for username/email
    expect(issues.length).toBeGreaterThan(0);
  });

  it('validateLoginUser and validateEmail: email requirements and password presence', () => {
    const good = validateLoginUser.safeParse({
      email: 'bob@x.com',
      password: 'x',
    });
    expect(good.success).toBe(true);

    const badEmail = validateLoginUser.safeParse({
      email: 'bad',
      password: 'x',
    });
    expect(badEmail.success).toBe(false);

    const emailOnly = validateEmail.safeParse({ email: 'test@ok.com' });
    expect(emailOnly.success).toBe(true);
  });

  it('validateNewPassword: delegates to passwordSchema', () => {
    expect(
      validateNewPassword.safeParse({ password: 'Secret123!' }).success,
    ).toBe(true);
    expect(validateNewPassword.safeParse({ password: 'short' }).success).toBe(
      false,
    );
  });

  it('validateUpdateUser: optional fields allowed and password optional', () => {
    const ok = validateUpdateUser.safeParse({ username: 'bob' });
    expect(ok.success).toBe(true);

    // optional password must still follow rules when provided
    const badPass = validateUpdateUser.safeParse({ password: 'nopass' });
    expect(badPass.success).toBe(false);
  });
});
