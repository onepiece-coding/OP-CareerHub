/**
 * @file src/store/password/password-slice.ts
 */

import { handlePending, handleRejected } from "@/lib/utils";
import { type OperationState } from "@/lib/types";
import { createSlice } from "@reduxjs/toolkit";

import sendResetPasswordLink from "./actions/send-reset-password-link";
import getResetPasswordLink from "./actions/get-reset-password-link";
import resetPassword from "./actions/reset-password";

interface PasswordState {
  sendResetPasswordLink: OperationState;
  getResetPasswordLink: OperationState;
  resetPassword: OperationState;
}

const initialState: PasswordState = {
  sendResetPasswordLink: { status: "idle", error: null },
  getResetPasswordLink: { status: "idle", error: null },
  resetPassword: { status: "idle", error: null },
};

const passwordSlice = createSlice({
  name: "password",
  initialState,
  reducers: {
    clearSendResetPasswordLinkState: (state) => {
      state.sendResetPasswordLink = { status: "idle", error: null };
    },
    clearGetResetPasswordLinkState: (state) => {
      state.getResetPasswordLink = { status: "idle", error: null };
    },
    clearResetPasswordState: (state) => {
      state.resetPassword = { status: "idle", error: null };
    },
  },
  extraReducers: (builder) => {
    // Send Reset Password Link
    builder.addCase(sendResetPasswordLink.pending, (state) => {
      handlePending(state, "sendResetPasswordLink");
    });
    builder.addCase(sendResetPasswordLink.fulfilled, (state) => {
      state.sendResetPasswordLink.status = "succeeded";
    });
    builder.addCase(sendResetPasswordLink.rejected, (state, action) => {
      handleRejected(state, "sendResetPasswordLink", action);
    });

    // Get Reset Password Link
    builder.addCase(getResetPasswordLink.pending, (state) => {
      handlePending(state, "getResetPasswordLink");
    });
    builder.addCase(getResetPasswordLink.fulfilled, (state) => {
      state.getResetPasswordLink.status = "succeeded";
    });
    builder.addCase(getResetPasswordLink.rejected, (state, action) => {
      handleRejected(state, "getResetPasswordLink", action);
    });

    // Reset Password
    builder.addCase(resetPassword.pending, (state) => {
      handlePending(state, "resetPassword");
    });
    builder.addCase(resetPassword.fulfilled, (state) => {
      state.resetPassword.status = "succeeded";
    });
    builder.addCase(resetPassword.rejected, (state, action) => {
      handleRejected(state, "resetPassword", action);
    });
  },
});

export const {
  clearSendResetPasswordLinkState,
  clearGetResetPasswordLinkState,
  clearResetPasswordState,
} = passwordSlice.actions;

export { sendResetPasswordLink, getResetPasswordLink, resetPassword };

export default passwordSlice.reducer;
