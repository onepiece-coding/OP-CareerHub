/**
 * @file src/store/applications/actions/get-candidate-applications.ts
 */

import { createAsyncThunk } from "@reduxjs/toolkit";
import { getCacheKey } from "../applications-slice";
import { axiosErrorHandler } from "@/lib/utils";
import type { Application } from "@/lib/types";
import type { RootState } from "@/store";

import api from "@/services/api-service";

type TResponse = {
  pagination: {
    totalPages: number;
  };
  data: Application[];
};

export type QuerySchema = {
  limit: number;
  page: number;
  _id?: string;
};

const getCandidateApplications = createAsyncThunk<
  TResponse,
  QuerySchema,
  { state: RootState }
>(
  "applications/getCandidateApplications",
  async (querySchema: QuerySchema, thunk) => {
    const { fulfillWithValue, rejectWithValue, signal } = thunk;

    try {
      const response = await api.get<TResponse>(`/applications/applicant`, {
        params: querySchema,
        signal,
      });

      return fulfillWithValue(response.data);
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Get Candidate Applications:", error);
      }
      return rejectWithValue(axiosErrorHandler(error));
    }
  },
  {
    // If this returns false, the thunk cancels execution completely.
    condition: (querySchema, { getState }) => {
      const state = getState();
      const key = getCacheKey(querySchema);
      return !state.applications.userApplicationsCache[key];
    },
  },
);

export default getCandidateApplications;
