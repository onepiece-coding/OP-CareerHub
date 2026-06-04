/**
 * @file src/validations/jobs-schemas.ts
 */

import { rules, type ValidationSchema } from "@/lib/validation";
import { EMAIL_REGEX } from "@/lib/constants";
import { todayISO } from "@/lib/utils";

export type JobValues = {
  jobFacilities: string[];
  jobDescription: string;
  jobLocation: string;
  jobDeadline: string;
  jobSkills: string[];
  jobContact: string;
  jobVacancy: string;
  jobSalary: string;
  jobStatus: string;
  position: string;
  company: string;
  jobType: string;
};

export const addJobSchema: ValidationSchema<JobValues> = {
  company: [
    rules.required("Company name is required."),
    rules.minLength(5, "company too short."),
    rules.maxLength(100, "company too long."),
  ],
  position: [
    rules.required("Position is required."),
    rules.minLength(5, "position too short."),
    rules.maxLength(100, "position too long."),
  ],
  jobDescription: [
    rules.required("Job Description is required."),
    rules.minLength(5, "Job Description too short."),
    rules.maxLength(200, "Job Description too long."),
  ],
  jobStatus: [
    rules.required("Job Status is required"),
    rules.enum(
      ["pending", "interview", "declined"] as const,
      "Invalid selection.",
    ),
  ],
  jobType: [
    rules.required("Job Type is required"),
    rules.enum(
      ["full-time", "part-time", "internship"] as const,
      "Invalid selection.",
    ),
  ],
  jobLocation: [rules.required("Job Location is required.")],
  jobVacancy: [rules.required("Job Vacancy is required.")],
  jobSalary: [rules.required("job Salary is required.")],
  jobDeadline: [
    rules.required("Job Deadline is required."),
    rules.custom<JobValues>((value) => {
      if (typeof value !== "string" || value === "") return null;
      return value < todayISO() // ✅ Fresh date on every validation call
        ? "Deadline must be today or later."
        : null;
    }),
  ],
  jobSkills: [
    rules.minTags(3, "3 Skills at least."),
    rules.maxTags(10, "10 Skills at most."),
  ],
  jobFacilities: [
    rules.minTags(3, "3 Job Facilities at least."),
    rules.maxTags(10, "10 Job Facilities at most."),
  ],
  jobContact: [
    rules.required("Job Contact is required."),
    rules.pattern(EMAIL_REGEX, "Please enter a valid email address."),
  ],
};

export const updateJobSchema: ValidationSchema<JobValues> = {
  company: [
    rules.optional(),
    rules.minLength(5, "company too short."),
    rules.maxLength(100, "company too long."),
  ],
  position: [
    rules.optional(),
    rules.minLength(5, "position too short."),
    rules.maxLength(100, "position too long."),
  ],
  jobDescription: [
    rules.optional(),
    rules.minLength(5, "Job Description too short."),
    rules.maxLength(200, "Job Description too long."),
  ],
  jobStatus: [
    rules.optional(),
    rules.enum(
      ["pending", "interview", "declined"] as const,
      "Invalid selection.",
    ),
  ],
  jobType: [
    rules.optional(),
    rules.enum(
      ["full-time", "part-time", "internship"] as const,
      "Invalid selection.",
    ),
  ],
  jobLocation: [rules.optional(), rules.minLength(1)],
  jobVacancy: [rules.optional(), rules.minLength(1)],
  jobSalary: [rules.optional(), rules.minLength(1)],
  jobDeadline: [
    rules.optional(),
    rules.custom<JobValues>((value) => {
      if (typeof value !== "string" || value === "") return null;
      return value < todayISO() // ✅ Fresh date on every validation call
        ? "Deadline must be today or later."
        : null;
    }),
  ],
  jobSkills: [
    rules.optional(),
    rules.minTags(3, "3 Skills at least."),
    rules.maxTags(10, "10 Skills at most."),
  ],
  jobFacilities: [
    rules.optional(),
    rules.minTags(3, "3 Job Facilities at least."),
    rules.maxTags(10, "10 Job Facilities at most."),
  ],
  jobContact: [
    rules.optional(),
    rules.pattern(EMAIL_REGEX, "Please enter a valid email address."),
  ],
};
