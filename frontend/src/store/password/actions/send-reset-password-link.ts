/**
 * @file src/store/password/actions/send-reset-password-link.ts
 */

import type { SendResetPasswordLinkValues } from "@/validations";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosErrorHandler } from "@/lib/utils";

import api from "@/services/api-service";

type TFormData = SendResetPasswordLinkValues;

const sendResetPasswordLink = createAsyncThunk(
  "password/sendResetPasswordLink",
  async (formData: TFormData, thunk) => {
    const { rejectWithValue } = thunk;
    try {
      await api.post("/password/reset-password-link", formData);
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Forgot Password:", error);
      }
      return rejectWithValue(axiosErrorHandler(error));
    }
  },
);

export default sendResetPasswordLink;
