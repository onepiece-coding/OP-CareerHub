/**
 * @file src/store/auth/actions/email-verification.ts
 */

import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosErrorHandler } from "@/lib/utils";

import api from "@/services/api-service";

type AuthInfo = {
  userId: string;
  token: string;
};

const emailVerification = createAsyncThunk(
  "auth/emailVerification",
  async (authInfo: AuthInfo, thunk) => {
    const { rejectWithValue } = thunk;
    try {
      await api.get(`/auth/${authInfo.userId}/verify/${authInfo.token}`);
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Email Verification:", error);
      }
      return rejectWithValue(axiosErrorHandler(error));
    }
  },
);

export default emailVerification;
