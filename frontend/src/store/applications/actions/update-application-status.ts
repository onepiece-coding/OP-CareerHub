/**
 * @file src/store/applications/actions/update-application-status.ts
 */

import type { APP_STATUS, Application } from "@/lib/types";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosErrorHandler } from "@/lib/utils";

import api from "@/services/api-service";

type UpdateApplicationStatusPayload = {
  applicationId: string;
  body: {
    status: APP_STATUS;
    jobId: string;
  };
};

type TResponse = {
  data: Application;
  status: boolean;
};

const updateApplicationStatus = createAsyncThunk(
  "applications/updateApplicationStatus",
  async ({ applicationId, body }: UpdateApplicationStatusPayload, thunk) => {
    const { fulfillWithValue, rejectWithValue } = thunk;
    try {
      const response = await api.patch<TResponse>(
        `/applications/${applicationId}`,
        body,
      );

      return fulfillWithValue(response.data);
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Update Application Status:", error);
      }
      return rejectWithValue(axiosErrorHandler(error));
    }
  },
);

export default updateApplicationStatus;
