import { z } from 'zod';
import mongoose from 'mongoose';

// Validate Add Job
export const validateApplyInJob = z.object({
  jobId: z
    .string()
    .trim()
    .refine((v) => (v ? mongoose.Types.ObjectId.isValid(v) : true), {
      message: 'Invalid jobId',
    }),
});

// Validate Update Job
export const validateUpdateApplication = z.object({
  jobId: z
    .string()
    .trim()
    .refine((v) => (v ? mongoose.Types.ObjectId.isValid(v) : true), {
      message: 'Invalid jobId',
    }),
  status: z.enum(['pending', 'accepted', 'rejected']),
});

export type ApplyInJobInput = z.infer<typeof validateApplyInJob>;
export type UpdateApplicationInput = z.infer<typeof validateUpdateApplication>;
