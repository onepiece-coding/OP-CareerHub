/**
 * @file src/layouts/dashboard-layout/dashboard.data.ts
 */

import type { NavItem } from "@/lib/types";

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { type: "link", to: "/dashboard", label: "View Profile" },
  {
    type: "link",
    to: "/dashboard/administrative-information",
    label: "Administrative Information",
  },
  { type: "link", to: "/dashboard/manage-users", label: "Manage Users" },
];

export const RECRUITER_NAV_ITEMS: NavItem[] = [
  { type: "link", to: "/dashboard", label: "View Profile" },
  { type: "link", to: "/dashboard/add-job", label: "Add a job" },
  { type: "link", to: "/dashboard/recruiter-jobs", label: "Recruiter Jobs" },
  {
    type: "link",
    to: "/dashboard/recruiter-applications",
    label: "Recruiter Applications",
  },
  {
    type: "link",
    to: "/dashboard/notifications",
    label: "Recruiter Notifications",
  },
];

export const USER_NAV_ITEMS: NavItem[] = [
  { type: "link", to: "/dashboard", label: "View Profile" },
  {
    type: "link",
    to: "/dashboard/user-applications",
    label: "User Applications",
  },
  {
    type: "link",
    to: "/dashboard/notifications",
    label: "User Notifications",
  },
];
