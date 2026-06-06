/**
 * @file src/store/jobs/actions/get-recruiter-jobs.ts
 */

import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosErrorHandler } from "@/lib/utils";
import type { RootState } from "@/store";
import type { Job } from "@/lib/types";

import api from "@/services/api-service";

type TResponse = {
  status: boolean;
  data: Job[];
};

const getRecruiterJobs = createAsyncThunk(
  "jobs/getRecruiterJobs",
  async (_, thunk) => {
    const { fulfillWithValue, rejectWithValue, getState, signal } = thunk;
    const { jobs } = getState() as RootState;

    try {
      if (jobs.recruiterJobs.length > 1)
        return fulfillWithValue({ status: true, data: jobs.recruiterJobs });

      const response = await api.get<TResponse>(`/jobs/my-jobs`, { signal });
      return fulfillWithValue(response.data);
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Get Recruiter Jobs:", error);
      }
      return rejectWithValue(axiosErrorHandler(error));
    }
  },
);

export default getRecruiterJobs;
