/**
 * @file src/store/notifications/actions/get-notifications.ts
 */

import { createAsyncThunk } from "@reduxjs/toolkit";
import type { Notification } from "@/lib/types";
import { axiosErrorHandler } from "@/lib/utils";
import type { RootState } from "@/store";

import api from "@/services/api-service";

type TResponse = {
  data: Notification[];
  success: boolean;
};

const getNotifications = createAsyncThunk(
  "notifications/getNotifications",
  async (_, thunk) => {
    const { fulfillWithValue, rejectWithValue, getState, signal } = thunk;
    const { notifications } = getState() as RootState;

    try {
      if (notifications.records.length > 0)
        return fulfillWithValue({
          success: true,
          data: notifications.records,
        });

      const response = await api.get<TResponse>(`/notifications`, {
        signal,
      });

      return fulfillWithValue(response.data);
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Get Notifications:", error);
      }
      return rejectWithValue(axiosErrorHandler(error));
    }
  },
);

export default getNotifications;
