/**
 * @file src/store/applications/actions/get-recruiter-jobs-applications.ts
 */

import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosErrorHandler } from "@/lib/utils";
import type { Application } from "@/lib/types";

import api from "@/services/api-service";
import type { RootState } from "@/store";
import { getCacheKey } from "../applications-slice";

type TResponse = {
  pagination: {
    totalPages: number;
  };
  data: Application[];
  status: boolean;
};

export type QuerySchema = {
  limit: number;
  page: number;
  _id?: string;
};

const getRecruiterJobsApplications = createAsyncThunk<
  TResponse,
  QuerySchema,
  { state: RootState }
>(
  "applications/getRecruiterJobsApplications",
  async (querySchema: QuerySchema, thunk) => {
    const { fulfillWithValue, rejectWithValue, signal } = thunk;

    try {
      const response = await api.get<TResponse>(`/applications/recruiter`, {
        params: querySchema,
        signal,
      });

      return fulfillWithValue(response.data);
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Get Recruiter Jobs Applications:", error);
      }
      return rejectWithValue(axiosErrorHandler(error));
    }
  },
  {
    // If this returns false, the thunk cancels execution completely.
    condition: (querySchema, { getState }) => {
      const state = getState();
      const key = getCacheKey(querySchema);
      return !state.applications.recruiterApplicationsCache[key];
    },
  },
);

export default getRecruiterJobsApplications;
