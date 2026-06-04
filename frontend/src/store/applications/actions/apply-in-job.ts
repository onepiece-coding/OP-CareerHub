/**
 * @file src/store/jobs/actions/update-single-job.ts
 */

import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosErrorHandler } from "@/lib/utils";

import api from "@/services/api-service";

const applyInJob = createAsyncThunk(
  "applications/applyInJob",
  async (jobId: string, thunk) => {
    const { rejectWithValue } = thunk;
    try {
      await api.post(`/applications/apply`, { jobId });
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Update Single Job:", error);
      }
      return rejectWithValue(axiosErrorHandler(error));
    }
  },
);

export default applyInJob;
