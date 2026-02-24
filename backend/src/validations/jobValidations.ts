import { z } from 'zod';
import { sanitizeText } from '../utils/sanitize.js';

// Validate Add Job
export const validateAddJob = z.object({
  company: z.preprocess(
    sanitizeText,
    z.string().trim().min(5, 'company too short').max(100, 'company too long'),
  ),
  position: z.preprocess(
    sanitizeText,
    z
      .string()
      .trim()
      .min(5, 'position too short')
      .max(100, 'position too long'),
  ),
  jobDescription: z.preprocess(
    sanitizeText,
    z
      .string()
      .trim()
      .min(5, 'jobDescription too short')
      .max(200, 'jobDescription too long'),
  ),
  jobStatus: z.enum(['pending', 'interview', 'declined']).optional(),
  jobType: z.enum(['full-time', 'part-time', 'internship']).optional(),
  jobLocation: z.preprocess(sanitizeText, z.string().trim()),
  jobVacancy: z.preprocess(sanitizeText, z.string().trim()),
  jobSalary: z.preprocess(sanitizeText, z.string().trim()),
  jobDeadline: z.preprocess(sanitizeText, z.string().trim()),
  jobSkills: z.preprocess((val: unknown) => {
    if (typeof val === 'string') {
      return val
        .split(/[,\\n]+/)
        .map((s) => (sanitizeText(s) as string).trim())
        .filter(Boolean);
    }
    if (Array.isArray(val)) {
      return val
        .map((it: unknown) =>
          (
            sanitizeText(typeof it === 'string' ? it : String(it)) as string
          ).trim(),
        )
        .filter(Boolean);
    }
    return [];
  }, z.array(z.string().trim())),

  jobFacilities: z.preprocess((val: unknown) => {
    if (typeof val === 'string') {
      return val
        .split(/[,\\n]+/)
        .map((s) => (sanitizeText(s) as string).trim())
        .filter(Boolean);
    }
    if (Array.isArray(val)) {
      return val
        .map((it: unknown) =>
          (
            sanitizeText(typeof it === 'string' ? it : String(it)) as string
          ).trim(),
        )
        .filter(Boolean);
    }
    return [];
  }, z.array(z.string().trim())),

  jobContact: z.preprocess(sanitizeText, z.string().trim()),
});

// Validate Update Job
export const validateUpdateJob = z.object({
  company: z.preprocess(
    sanitizeText,
    z
      .string()
      .trim()
      .min(5, 'company too short')
      .max(100, 'company too long')
      .optional(),
  ),
  position: z.preprocess(
    sanitizeText,
    z
      .string()
      .trim()
      .min(5, 'position too short')
      .max(100, 'position too long')
      .optional(),
  ),
  jobDescription: z.preprocess(
    sanitizeText,
    z
      .string()
      .trim()
      .min(5, 'jobDescription too short')
      .max(200, 'jobDescription too long')
      .optional(),
  ),
  jobStatus: z.enum(['pending', 'interview', 'declined']).optional(),
  jobType: z.enum(['full-time', 'part-time', 'internship']).optional(),
  jobLocation: z.preprocess(sanitizeText, z.string().trim().optional()),
  jobVacancy: z.preprocess(sanitizeText, z.string().trim().optional()),
  jobSalary: z.preprocess(sanitizeText, z.string().trim().optional()),
  jobDeadline: z.preprocess(sanitizeText, z.string().trim().optional()),
  jobSkills: z.preprocess((val: unknown) => {
    if (typeof val === 'string') {
      return val
        .split(/[,\\n]+/)
        .map((s) => (sanitizeText(s) as string).trim())
        .filter(Boolean);
    }
    if (Array.isArray(val)) {
      return val
        .map((it: unknown) =>
          (
            sanitizeText(typeof it === 'string' ? it : String(it)) as string
          ).trim(),
        )
        .filter(Boolean);
    }
    return [];
  }, z.array(z.string().trim()).optional()),

  jobFacilities: z.preprocess((val: unknown) => {
    if (typeof val === 'string') {
      return val
        .split(/[,\\n]+/)
        .map((s) => (sanitizeText(s) as string).trim())
        .filter(Boolean);
    }
    if (Array.isArray(val)) {
      return val
        .map((it: unknown) =>
          (
            sanitizeText(typeof it === 'string' ? it : String(it)) as string
          ).trim(),
        )
        .filter(Boolean);
    }
    return [];
  }, z.array(z.string().trim()).optional()),

  jobContact: z.preprocess(sanitizeText, z.string().trim().optional()),
});

export type AddJobInput = z.infer<typeof validateAddJob>;
export type UpdateJobInput = z.infer<typeof validateUpdateJob>;
