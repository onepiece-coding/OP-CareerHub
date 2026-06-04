/**
 * @file src/store/jobs/actions/update-single-job.ts
 */

import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosErrorHandler } from "@/lib/utils";
import type { JobValues } from "@/validations";
import type { Job } from "@/lib/types";

import api from "@/services/api-service";

type UpdateJobPayload = {
  jobId: string;
  data: Partial<JobValues>;
};

type TResponse = {
  status: boolean;
  result: Job;
};

const updateSingleJob = createAsyncThunk(
  "jobs/updateSingleJob",
  async ({ jobId, data }: UpdateJobPayload, thunk) => {
    const { fulfillWithValue, rejectWithValue } = thunk;
    try {
      const response = await api.patch<TResponse>(`/jobs/${jobId}`, data);
      return fulfillWithValue(response.data);
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Update Single Job:", error);
      }
      return rejectWithValue(axiosErrorHandler(error));
    }
  },
);

export default updateSingleJob;
