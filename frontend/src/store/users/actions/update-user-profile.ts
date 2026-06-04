/**
 * @file src/store/users/actions/update-user-profile.ts
 */

import type { UpdateUserProfileValues } from "@/validations";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosErrorHandler } from "@/lib/utils";
import type { User } from "@/lib/types";

import api from "@/services/api-service";

type UpdateUserProfilePayload = {
  userId: string;
  data: Partial<UpdateUserProfileValues>;
};

const updateUserProfile = createAsyncThunk(
  "users/updateUserProfile",
  async ({ userId, data }: UpdateUserProfilePayload, thunk) => {
    const { fulfillWithValue, rejectWithValue } = thunk;

    try {
      const response = await api.patch<User>(`/users/${userId}`, data);
      return fulfillWithValue(response.data);
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Update User Profile:", error);
      }
      return rejectWithValue(axiosErrorHandler(error));
    }
  },
);

export default updateUserProfile;
