/**
 * @file src/store/notifications/actions/mark-notification-as-read.ts
 */

import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosErrorHandler } from "@/lib/utils";
import type { Notification } from "@/lib/types";

import api from "@/services/api-service";

type TResponse = {
  data: Notification;
  success: boolean;
};

const markNotificationAsRead = createAsyncThunk(
  "notifications/markNotificationAsRead",
  async (notificationId: string, thunk) => {
    const { fulfillWithValue, rejectWithValue } = thunk;

    try {
      const response = await api.patch<TResponse>(
        `/notifications/${notificationId}`,
      );

      return fulfillWithValue(response.data);
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Mark Notification As Read", error);
      }
      return rejectWithValue(axiosErrorHandler(error));
    }
  },
);

export default markNotificationAsRead;
