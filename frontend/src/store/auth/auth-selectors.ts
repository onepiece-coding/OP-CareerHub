/**
 * @file src/store/auth/auth-selectors.ts
 */

import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "..";
import { Role } from "@/lib/types";

export const selectAuthState = (state: RootState) => state.auth;

// ❌ createSelector wrapping a simple property access — no computation to memoize
// export const selectRegisterStatus = createSelector(
//   [selectAuthState],
//   (auth) => auth.register.status,
// );

export const selectRegisterStatus = (state: RootState) =>
  state.auth.register.status;

// ❌ createSelector wrapping a simple property access — no computation to memoize
// export const selectRegisterError = createSelector(
//   [selectAuthState],
//   (auth) => auth.register.error,
// );

export const selectRegisterError = (state: RootState) =>
  state.auth.register.error;

// createSelector reserved for actual derived values:
export const selectIsRegistering = createSelector(
  [selectRegisterStatus],
  (status) => status === "pending", // ✅ This IS a derivation
);

export const selectLoginStatus = (state: RootState) => state.auth.login.status;

export const selectLoginError = (state: RootState) => state.auth.login.error;

export const selectCurrentUser = (state: RootState) => state.auth.user;

export const selectLogoutStatus = (state: RootState) =>
  state.auth.logout.status;

export const selectLogoutError = (state: RootState) => state.auth.logout.error;

export const selectEmailVerificationStatus = (state: RootState) =>
  state.auth.emailVerification.status;

export const selectEmailVerificationError = (state: RootState) =>
  state.auth.emailVerification.error;

export const selectIsAuthenticated = createSelector(
  [selectCurrentUser],
  (user) => user !== null,
);

export const selectCurrentUserRole = (state: RootState) =>
  state.auth.user?.role;

export const selectIsAdmin = createSelector(
  [selectCurrentUser],
  (user) => user?.role === Role.Admin,
);

export const selectIsRecruiter = createSelector(
  [selectCurrentUser],
  (user) => user?.role === Role.Recruiter,
);

export const selectIsUser = createSelector(
  [selectCurrentUser],
  (user) => user?.role === Role.User,
);
