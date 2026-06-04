/**
 * @file src/store/auth/actions/get-me.ts
 */

import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosErrorHandler } from "@/lib/utils";
import type { User } from "@/lib/types";

import api from "@/services/api-service";

export const getMe = createAsyncThunk("auth/getMe", async (_, thunk) => {
  try {
    const { data } = await api.get<{ result: User }>("/auth/me", {
      signal: thunk.signal,
    });
    return data.result;
  } catch (error) {
    return thunk.rejectWithValue(axiosErrorHandler(error));
  }
});
