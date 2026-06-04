/**
 * @file src/store/users/actions/resume-upload.ts
 */

import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosErrorHandler } from "@/lib/utils";

import api from "@/services/api-service";

const resumeUpload = createAsyncThunk(
  "users/resumeUpload",
  async (formData: FormData, thunk) => {
    const { rejectWithValue } = thunk;
    try {
      await api.post(`/users/profile/resume-upload`, formData);
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Resume Upload:", error);
      }
      return rejectWithValue(axiosErrorHandler(error));
    }
  },
);

export default resumeUpload;
