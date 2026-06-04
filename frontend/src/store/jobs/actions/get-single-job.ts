/**
 * @file src/store/jobs/actions/get-single-job.ts
 */

import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosErrorHandler } from "@/lib/utils";
import type { Job } from "@/lib/types";

import api from "@/services/api-service";
import type { RootState } from "@/store";

type TResponse = {
  status: boolean;
  result: Job;
};

const getSingleJob = createAsyncThunk(
  "jobs/getSingleJob",
  async (
    { jobId, type }: { jobId: string; type: "recruiterJobs" | "allJobs" },
    thunk,
  ) => {
    const { fulfillWithValue, rejectWithValue, getState, signal } = thunk;
    const { jobs } = getState() as RootState;

    try {
      const job = jobs[type].find((job) => job._id === jobId);
      if (job) return fulfillWithValue({ status: true, result: job });

      const response = await api.get<TResponse>(`/jobs/${jobId}`, { signal });
      return fulfillWithValue(response.data);
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Get Single Job:", error);
      }
      return rejectWithValue(axiosErrorHandler(error));
    }
  },
);

export default getSingleJob;
