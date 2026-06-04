/**
 * @file src/store/password/actions/reset-password.ts
 */

import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosErrorHandler } from "@/lib/utils";

import api from "@/services/api-service";

type ResetPasswordInfo = {
  authInfo: {
    userId: string;
    token: string;
  };
  formData: {
    password: string;
  };
};

const resetPassword = createAsyncThunk(
  "password/resetPassword",
  async (resetPasswordInfo: ResetPasswordInfo, thunk) => {
    const { rejectWithValue } = thunk;
    try {
      await api.post(
        `/password/reset-password/${resetPasswordInfo.authInfo.userId}/${resetPasswordInfo.authInfo.token}`,
        { password: resetPasswordInfo.formData.password },
      );
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Reset Password:", error);
      }
      return rejectWithValue(axiosErrorHandler(error));
    }
  },
);

export default resetPassword;
