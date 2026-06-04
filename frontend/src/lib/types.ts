/**
 * @file src/lib/types.ts
 */

export type Status = "idle" | "pending" | "succeeded" | "failed";

export interface NavLinkItem {
  label: string;
  type: "link";
  to: string;
}

export interface NavActionItem {
  action: "logout"; // extensible: 'logout' | 'openModal' | etc.
  type: "action";
  label: string;
}

export type NavItem = NavLinkItem | NavActionItem;

export interface OperationState {
  error: string | null;
  status: Status;
}

export interface File {
  publicId: string | null;
  url: string;
}

export const Role = {
  Recruiter: "recruiter",
  Admin: "admin",
  User: "user",
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const APP_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
} as const;

export type APP_STATUS = (typeof APP_STATUS)[keyof typeof APP_STATUS];

export interface PaginationInfo {
  totalPages: number;
  results: number;
  current: number;
  limit: number;
}

export interface User {
  gender: "male" | "female";
  profilePhoto: File;
  createdAt: string;
  username: string;
  location: string;
  email: string;
  resume: File;
  _id: string;
  role: Role;
}

export interface AllInfo {
  recruiters: number;
  applicants: number;
  interviews: number;
  rejected: number;
  pending: number;
  admins: number;
  users: number;
  jobs: number;
}

/** The shape you pass to addToast() — id is not required at creation time */
export interface ToastInput {
  type: "primary" | "success" | "warning" | "danger";
  title?: string | null;
  message: string;
}

/** The shape that lives in Redux state — id is always present */
export interface Toast extends ToastInput {
  id: string; // ✅ Always required after creation
}

export interface Job {
  // createdBy: Types.ObjectId;
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
  _id: string;
}

export interface Application {
  dateOfApplication: Date;
  dateOfJoining: Date;
  applicantId: string;
  recruiterId: string;
  status: APP_STATUS;
  resume: File;
  _id: string;
  jobId: Job;
}

export interface Notification {
  type: "application_status_update" | "job_status_update" | "new_application";
  relatedId: string;
  createdAt: string;
  recipient: string;
  message: string;
  read: boolean;
  _id: string;
}
