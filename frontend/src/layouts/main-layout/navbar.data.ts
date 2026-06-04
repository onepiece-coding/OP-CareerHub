/**
 * @file src/layouts/main-layout/navbar.data.ts
 */

import type { NavItem } from "@/lib/types";

export const UNAUTHENTICATED_NAV_ITEMS: NavItem[] = [
  { type: "link", to: "/", label: "Home" },
  { type: "link", to: "/jobs", label: "Jobs" },
  { type: "link", to: "/auth/register", label: "Register" },
  { type: "link", to: "/auth/login", label: "Login" },
];

export const AUTHENTICATED_NAV_ITEMS: NavItem[] = [
  { type: "link", to: "/", label: "Home" },
  { type: "link", to: "/jobs", label: "Jobs" },
  { type: "link", to: "/dashboard", label: "Dashboard" },
  { type: "action", action: "logout", label: "Logout" },
];
