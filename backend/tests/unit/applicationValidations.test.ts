import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import {
  validateApplyInJob,
  validateUpdateApplication,
} from '../../src/validations/applicationValidations.js';

describe('applicationValidations (unit)', () => {
  it('validateApplyInJob: accepts valid ObjectId strings', () => {
    const id = new mongoose.Types.ObjectId().toString();
    const res = validateApplyInJob.safeParse({ jobId: id });
    expect(res.success).toBe(true);
    if (res.success) expect(res.data.jobId).toBe(id);
  });

  it('validateApplyInJob: rejects invalid jobId', () => {
    const res = validateApplyInJob.safeParse({ jobId: 'not-an-id' });
    expect(res.success).toBe(false);

    const issues = (res as any).error?.issues ?? [];
    expect(
      issues.some((i: any) => String(i.message).includes('Invalid jobId')),
    ).toBe(true);
  });

  it('validateUpdateApplication: accepts valid status and jobId', () => {
    const id = new mongoose.Types.ObjectId().toString();
    const res = validateUpdateApplication.safeParse({
      jobId: id,
      status: 'pending',
    });
    expect(res.success).toBe(true);
  });

  it('validateUpdateApplication: rejects invalid status', () => {
    const res = validateUpdateApplication.safeParse({
      jobId: '507f1f77bcf86cd799439011',
      status: 'unknown' as any,
    });
    expect(res.success).toBe(false);
  });
});
