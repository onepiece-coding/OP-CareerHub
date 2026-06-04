/**
 * @file src/store/notifications/actions/delete-notification.ts
 */

import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosErrorHandler } from "@/lib/utils";

import api from "@/services/api-service";

const deleteNotification = createAsyncThunk(
  "notifications/deleteNotification",
  async (notificationId: string, thunk) => {
    const { rejectWithValue } = thunk;

    try {
      await api.delete(`/notifications/${notificationId}`);
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Delete Notification", error);
      }
      return rejectWithValue(axiosErrorHandler(error));
    }
  },
);

export default deleteNotification;
