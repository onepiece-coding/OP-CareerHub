/**
 * @file src/store/jobs/actions/get-all-jobs.ts
 */

import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosErrorHandler } from "@/lib/utils";
import type { Job } from "@/lib/types";

import api from "@/services/api-service";
import type { RootState } from "@/store";
import { getCacheKey } from "../jobs-slice";

type TResponse = {
  pagination: {
    totalPages: number;
  };
  data: Job[];
};

export type QuerySchema = {
  jobStatus?: string;
  jobType?: string;
  search: string;
  limit: number;
  page: number;
  sort: string;
};

const getAllJobs = createAsyncThunk<
  TResponse,
  QuerySchema,
  { state: RootState }
>(
  "jobs/getAllJobs",
  async (querySchema: QuerySchema, thunk) => {
    const { fulfillWithValue, rejectWithValue, signal } = thunk;

    try {
      const response = await api.get<TResponse>(`/jobs`, {
        params: querySchema,
        signal,
      });
      return fulfillWithValue(response.data);
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Get All Jobs:", error);
      }
      return rejectWithValue(axiosErrorHandler(error));
    }
  },
  {
    // If this returns false, the thunk cancels execution completely.
    condition: (querySchema, { getState }) => {
      const state = getState();
      const key = getCacheKey(querySchema);
      return !state.jobs.cache[key];
    },
  },
);

export default getAllJobs;
