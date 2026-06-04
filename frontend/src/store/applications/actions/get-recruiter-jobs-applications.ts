/**
 * @file src/store/applications/actions/get-recruiter-jobs-applications.ts
 */

import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosErrorHandler } from "@/lib/utils";
import type { Application } from "@/lib/types";

import api from "@/services/api-service";
import type { RootState } from "@/store";

type TResponse = {
  result: Application[];
  status: boolean;
};

const getRecruiterJobsApplications = createAsyncThunk(
  "applications/getRecruiterJobsApplications",
  async (_, thunk) => {
    const { fulfillWithValue, rejectWithValue, getState, signal } = thunk;
    const { applications } = getState() as RootState;

    try {
      if (applications.recruiterJobsApplications.length > 0)
        return fulfillWithValue({
          status: true,
          result: applications.recruiterJobsApplications,
        });

      const response = await api.get<TResponse>(`/applications/recruiter`, {
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
);

export default getRecruiterJobsApplications;
