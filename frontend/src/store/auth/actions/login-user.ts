/**
 * @file src/store/auth/actions/login-user.ts
 */

import { createAsyncThunk } from "@reduxjs/toolkit";
import type { LoginValues } from "@/validations";
import { axiosErrorHandler } from "@/lib/utils";

import api from "@/services/api-service";
import type { User } from "@/lib/types";

type LoginPayload = LoginValues;

interface Response {
  unreadNotificationsCount: number;
  user: User;
}

const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (formData: LoginPayload, thunk) => {
    const { fulfillWithValue, rejectWithValue } = thunk;
    try {
      const { data } = await api.post<Response>("/auth/login", formData);
      return fulfillWithValue(data);
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Login User:", error);
      }
      return rejectWithValue(axiosErrorHandler(error));
    }
  },
);

export default loginUser;
