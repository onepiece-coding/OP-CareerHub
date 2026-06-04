/**
 * @file src/store/jobs/actions/add-job.ts
 */

import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosErrorHandler } from "@/lib/utils";
import type { JobValues } from "@/validations";
import type { Job } from "@/lib/types";

import api from "@/services/api-service";

type AddJobPayload = JobValues;

type TResponse = {
  status: boolean;
  result: Job;
};

const addJob = createAsyncThunk(
  "jobs/AddJob",
  async (formData: AddJobPayload, thunk) => {
    const { fulfillWithValue, rejectWithValue } = thunk;
    try {
      const response = await api.post<TResponse>(`/jobs`, formData);
      return fulfillWithValue(response.data);
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Add Job:", error);
      }
      return rejectWithValue(axiosErrorHandler(error));
    }
  },
);

export default addJob;
