/**
 * @file src/store/users/actions/delete-user.ts
 */

import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosErrorHandler } from "@/lib/utils";

import api from "@/services/api-service";

const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (userId: string, thunk) => {
    const {
      // fulfillWithValue,
      rejectWithValue,
    } = thunk;
    try {
      await api.delete(`/users/${userId}`);
      // return fulfillWithValue({ userId });
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Delete User:", error);
      }
      return rejectWithValue(axiosErrorHandler(error));
    }
  },
);

export default deleteUser;
