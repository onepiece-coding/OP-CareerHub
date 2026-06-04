/**
 * @file src/store/auth/actions/register-user.ts
 */

import { createAsyncThunk } from "@reduxjs/toolkit";
import type { RegisterValues } from "@/validations";
import { axiosErrorHandler } from "@/lib/utils";

import api from "@/services/api-service";

type RegisterPayload = Omit<RegisterValues, "confirmPassword">;

const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (formData: RegisterPayload, thunk) => {
    const { rejectWithValue } = thunk;
    try {
      await api.post("/auth/register", formData);
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Register User:", error);
      }
      return rejectWithValue(axiosErrorHandler(error));
    }
  },
);

export default registerUser;
