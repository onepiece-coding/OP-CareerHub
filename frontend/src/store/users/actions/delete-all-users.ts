/**
 * @file src/store/users/actions/delete-all-users.ts
 */

import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosErrorHandler } from "@/lib/utils";

import api from "@/services/api-service";

type DeleteSegment = "" | "recruiter" | "user";

const deleteAllUsers = createAsyncThunk(
  "users/deleteAllUsers",
  async (role: DeleteSegment, thunk) => {
    const {
      // fulfillWithValue,
      rejectWithValue,
    } = thunk;
    try {
      await api.delete(`/users?role=${role}`);
      // return fulfillWithValue({ userId });
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Delete All Users:", error);
      }
      return rejectWithValue(axiosErrorHandler(error));
    }
  },
);

export default deleteAllUsers;
