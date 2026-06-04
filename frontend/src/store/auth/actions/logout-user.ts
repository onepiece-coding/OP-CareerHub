/**
 * @file src/store/auth/actions/logout-user.ts
 */

import { createAsyncThunk } from "@reduxjs/toolkit";
// import { axiosErrorHandler } from "@/lib/utils";

import api from "@/services/api-service";

const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
  // const { rejectWithValue } = thunk;
  try {
    await api.post("/auth/logout");
  } catch (error) {
    /* if (import.meta.env.MODE === "development") {
      console.error("Logout User:", error);
    }
    return rejectWithValue(axiosErrorHandler(error)); */

    // We log the error but DON'T "rejectWithValue"
    // because we want the "fulfilled" case to trigger in the slice
    // to clear the local state anyway.
    if (import.meta.env.MODE === "development") {
      console.warn(
        "Server-side logout failed, clearing local state anyway.",
        error,
      );
    }
  }
});

export default logoutUser;
