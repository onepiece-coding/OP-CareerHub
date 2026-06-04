/**
 * @file src/store/admin/admin-selectors.ts
 */

import type { RootState } from "..";

export const selectGetAllInfoStatus = (state: RootState) =>
  state.admin.getAllInfo.status;

export const selectGetAllInfoError = (state: RootState) =>
  state.admin.getAllInfo.error;

export const selectAllInfo = (state: RootState) => state.admin.info;

export const selectUpdateUserRoleStatus = (state: RootState) =>
  state.admin.updateUserRole.status;

export const selectUpdateUserRoleError = (state: RootState) =>
  state.admin.updateUserRole.error;
