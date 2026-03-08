import { describe, it, expect } from 'vitest';
import {
  validateAddJob,
  validateUpdateJob,
} from '../../src/validations/jobValidations.js';

describe('jobValidations (unit)', () => {
  it('validateAddJob: accepts required fields and parses comma/newline skill strings', () => {
    const dto = {
      company: 'Company X Ltd',
      position: 'Senior Dev',
      jobDescription: 'A good description here',
      jobLocation: 'Remote',
      jobVacancy: '1',
      jobSalary: '1000',
      jobDeadline: '2026-01-01',
      jobSkills: '  js, \n\nts, , node  , ',
      jobFacilities: '',
      jobContact: 'hr@x.com',
    };

    const parsed = validateAddJob.safeParse(dto);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(Array.isArray(parsed.data.jobSkills)).toBe(true);
      expect(parsed.data.jobSkills).toContain('js');
      expect(parsed.data.jobSkills).toContain('ts');
      expect(parsed.data.jobSkills).toContain('node');
    }
  });

  it('validateAddJob: rejects too-short company/position/description', () => {
    const bad = {
      company: 'a',
      position: 'b',
      jobDescription: 'c',
      jobLocation: 'L',
      jobVacancy: '1',
      jobSalary: '1',
      jobDeadline: '1',
      jobSkills: [],
      jobFacilities: [],
      jobContact: '', // fails min(1)
    };

    const res = validateAddJob.safeParse(bad);
    expect(res.success).toBe(false);
  });

  it('validateUpdateJob: optional properties accepted and skills from array preserved', () => {
    const dto = {
      company: 'Company Update',
      position: 'Dev Role',
      jobDescription: 'Some description',
      jobLocation: 'Nowhere',
      jobVacancy: '2',
      jobSalary: '200',
      jobDeadline: '2026-06-06',
      jobSkills: ['alpha', 'beta'],
      jobFacilities: ['a', 'b'],
      jobContact: 'contact@c.com',
    };

    const parsed = validateUpdateJob.safeParse(dto);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.jobSkills).toEqual(['alpha', 'beta']);
      expect(parsed.data.jobFacilities).toEqual(['a', 'b']);
    }
  });

  it('validateUpdateJob: accepts jobSkills string and returns array', () => {
    const dto = {
      jobSkills: 'one,two,three',
    };
    const parsed = validateUpdateJob.safeParse(dto);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.jobSkills).toEqual(['one', 'two', 'three']);
    }
  });

  it('parses jobSkills from a comma/newline string and trims/filters blanks', () => {
    const dto = {
      company: 'Company XYZ',
      position: 'Frontend Dev',
      jobDescription: 'Responsible for building UI',
      jobLocation: 'Remote',
      jobVacancy: '1',
      jobSalary: '3000',
      jobDeadline: '2026-12-31',
      jobSkills: '  react, vue\nsvelte, ,angular  , ',
      jobFacilities: '',
      jobContact: 'hr@xyz.com',
    };

    const parsed = validateAddJob.safeParse(dto);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(Array.isArray(parsed.data.jobSkills)).toBe(true);
      expect(parsed.data.jobSkills).toContain('react');
      expect(parsed.data.jobSkills).toContain('vue');
      expect(parsed.data.jobSkills).toContain('svelte');
      expect(parsed.data.jobSkills).toContain('angular');
    }
  });

  it('accepts jobSkills as an array and coerces non-string items to strings', () => {
    const dto = {
      company: 'Company Y',
      position: 'Backend Dev',
      jobDescription: 'server side work',
      jobLocation: 'Office',
      jobVacancy: '2',
      jobSalary: '2500',
      jobDeadline: '2026-02-02',
      jobSkills: [1, 'two', null, undefined],
      jobFacilities: [0, 'health'],
      jobContact: 'hr@y.com',
    };

    const parsed = validateAddJob.safeParse(dto);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      // number should become '1'
      expect(parsed.data.jobSkills).toContain('1');
      expect(parsed.data.jobSkills).toContain('two');
      expect(parsed.data.jobFacilities).toContain('0');
      expect(parsed.data.jobFacilities).toContain('health');
    }
  });

  it('non-string/non-array jobSkills/facilities become empty arrays (preprocess fallback)', () => {
    const dto: any = {
      company: 'Company Z',
      position: 'Role Z',
      jobDescription: 'desc enough',
      jobLocation: 'nowhere',
      jobVacancy: '1',
      jobSalary: '1',
      jobDeadline: '2026-03-03',
      jobSkills: 12345,
      jobFacilities: null,
      jobContact: 'hr@z.com',
    };

    const parsed = validateAddJob.safeParse(dto);
    // empty arrays are allowed, so parsing should still succeed
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(Array.isArray(parsed.data.jobSkills)).toBe(true);
      expect(parsed.data.jobSkills.length).toBe(0);
      expect(Array.isArray(parsed.data.jobFacilities)).toBe(true);
    }
  });

  it('validateUpdateJob: optional jobSkills string -> array and optional properties accepted (again)', () => {
    const dto = {
      jobSkills: 'one,two,three',
    };
    const parsed = validateUpdateJob.safeParse(dto);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.jobSkills).toEqual(['one', 'two', 'three']);
    }

    // completely empty object should also be valid (all optional)
    const empty = validateUpdateJob.safeParse({});
    expect(empty.success).toBe(true);
  });

  it('validateAddJob: fails when required short fields are too short or jobContact missing', () => {
    const bad = {
      company: 'a',
      position: 'b',
      jobDescription: 'c',
      jobLocation: 'L',
      jobVacancy: '1',
      jobSalary: '1',
      jobDeadline: '1',
      jobSkills: [],
      jobFacilities: [],
      jobContact: '',
    };

    const res = validateAddJob.safeParse(bad);
    expect(res.success).toBe(false);
  });
});
