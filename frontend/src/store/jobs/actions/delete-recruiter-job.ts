/**
 * @file src/store/jobs/actions/delete-recruiter-job.ts
 */

import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosErrorHandler } from "@/lib/utils";

import api from "@/services/api-service";

const deleteRecruiterJob = createAsyncThunk(
  "jobs/deleteRecruiterJob",
  async (jobId: string, thunk) => {
    const { rejectWithValue } = thunk;
    try {
      await api.delete(`/jobs/${jobId}`);
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Delete Recruiter Job:", error);
      }
      return rejectWithValue(axiosErrorHandler(error));
    }
  },
);

export default deleteRecruiterJob;
