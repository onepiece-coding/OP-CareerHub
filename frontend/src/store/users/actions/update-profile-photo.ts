/**
 * @file src/store/users/actions/update-profile-photo.ts
 */

import { createAsyncThunk } from "@reduxjs/toolkit";
import type { File as Image } from "@/lib/types";
import { axiosErrorHandler } from "@/lib/utils";

import api from "@/services/api-service";

type TResponse = {
  profilePhoto: Image;
  message: string;
};

const updateProfilePhoto = createAsyncThunk(
  "users/updateProfilePhoto",
  async (formData: FormData, thunk) => {
    const { fulfillWithValue, rejectWithValue } = thunk;
    try {
      const response = await api.post<TResponse>(
        `/users/profile/profile-photo-upload`,
        formData,
      );
      return fulfillWithValue(response.data);
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Update Profile Photo:", error);
      }
      return rejectWithValue(axiosErrorHandler(error));
    }
  },
);

export default updateProfilePhoto;
