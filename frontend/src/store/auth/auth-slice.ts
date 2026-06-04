/**
 * @file src/store/auth/auth-slice.ts
 */

import { updateProfilePhoto, updateUserProfile } from "../users/users-slice";
import { handlePending, handleRejected } from "@/lib/utils";
import type { OperationState, User } from "@/lib/types";
import { UserService } from "@/services/auth-service";
import { createSlice } from "@reduxjs/toolkit";
import { getMe } from "./actions/get-me";

import emailVerification from "./actions/email-verification";
import registerUser from "./actions/register-user";
import logoutUser from "./actions/logout-user";
import loginUser from "./actions/login-user";

interface AuthState {
  emailVerification: OperationState;
  register: OperationState;
  login: OperationState;
  logout: OperationState;
  user: User | null;
}

const initialState: AuthState = {
  emailVerification: { status: "idle", error: null },
  register: { status: "idle", error: null },
  login: { status: "idle", error: null },
  logout: { status: "idle", error: null },
  user: UserService.getUser(),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearRegisterState: (state) => {
      state.register = { status: "idle", error: null };
    },
    clearLoginState: (state) => {
      state.login = { status: "idle", error: null };
    },
    clearEmailVerificationState: (state) => {
      state.emailVerification = { status: "idle", error: null };
    },
  },
  extraReducers: (builder) => {
    // Register User
    builder.addCase(registerUser.pending, (state) => {
      handlePending(state, "register");
    });
    builder.addCase(registerUser.fulfilled, (state) => {
      state.register.status = "succeeded";
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      handleRejected(state, "register", action);
    });

    // Login User
    builder.addCase(loginUser.pending, (state) => {
      handlePending(state, "login");
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.login.status = "succeeded";

      state.user = action.payload.user;

      UserService.setUser(action.payload.user);
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      handleRejected(state, "login", action);
    });

    // Logout User
    builder.addCase(logoutUser.pending, (state) => {
      handlePending(state, "logout");
    });
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.logout.status = "succeeded";
      state.user = null;

      UserService.removeUser();

      state.register.status = "idle";
      state.register.error = null;

      state.login.status = "idle";
      state.login.error = null;
    });
    builder.addCase(logoutUser.rejected, (state, action) => {
      handleRejected(state, "logout", action);
    });

    // Get Current User
    builder.addCase(getMe.fulfilled, (state, action) => {
      state.user = action.payload;
      UserService.setUser(action.payload); // Update local storage with fresh data
    });
    builder.addCase(getMe.rejected, (state) => {
      state.user = null;
      UserService.removeUser(); // Session invalid, clear local storage
    });

    // Email Verification
    builder.addCase(emailVerification.pending, (state) => {
      handlePending(state, "emailVerification");
    });
    builder.addCase(emailVerification.fulfilled, (state) => {
      state.emailVerification.status = "succeeded";
    });
    builder.addCase(emailVerification.rejected, (state, action) => {
      handleRejected(state, "emailVerification", action);
    });

    // Listen for the profile photo update from the other slice (users)
    builder.addCase(updateProfilePhoto.fulfilled, (state, action) => {
      if (state.user) {
        state.user.profilePhoto = action.payload.profilePhoto;
        UserService.setUser(state.user);
      }
    });

    // Listen for the user profile update from the other slice (users)
    builder.addCase(updateUserProfile.fulfilled, (state, action) => {
      if (state.user) {
        state.user = action.payload;
        UserService.setUser(state.user);
      }
    });
  },
});

export const {
  clearRegisterState,
  clearLoginState,
  clearEmailVerificationState,
} = authSlice.actions;

export { registerUser, loginUser, logoutUser, getMe, emailVerification };

export default authSlice.reducer;
