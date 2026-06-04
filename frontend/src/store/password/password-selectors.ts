/**
 * @file src/store/password/password-selectors.ts
 */

import type { RootState } from "..";

export const selectPasswordState = (state: RootState) => state.password;

export const selectSendResetPasswordLinkStatus = (state: RootState) =>
  state.password.sendResetPasswordLink.status;

export const selectSendResetPasswordLinkError = (state: RootState) =>
  state.password.sendResetPasswordLink.error;

export const selectGetResetPasswordLinkStatus = (state: RootState) =>
  state.password.getResetPasswordLink.status;

export const selectGetResetPasswordLinkError = (state: RootState) =>
  state.password.getResetPasswordLink.error;

export const selectResetPasswordStatus = (state: RootState) =>
  state.password.resetPassword.status;

export const selectResetPasswordError = (state: RootState) =>
  state.password.resetPassword.error;
