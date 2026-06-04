/**
 * @file src/store/notifications/notifications-slice.ts
 */

import type { Notification, OperationState } from "@/lib/types";
import { handlePending, handleRejected } from "@/lib/utils";
import { createSlice } from "@reduxjs/toolkit";

import markNotificationAsRead from "./actions/mark-notification-as-read";
import getNotifications from "./actions/get-notifications";
import deleteNotification from "./actions/delete-notification";

interface NotificationsState {
  markNotificationAsRead: OperationState;
  deleteNotification: OperationState;
  getNotifications: OperationState;

  records: Notification[];
}

const initialState: NotificationsState = {
  markNotificationAsRead: { status: "idle", error: null },
  deleteNotification: { status: "idle", error: null },
  getNotifications: { status: "idle", error: null },

  records: [],
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    clearGetNotificationsState: (state) => {
      state.getNotifications = { status: "idle", error: null };
    },
    clearMarkNotificationAsReadState: (state) => {
      state.markNotificationAsRead = { status: "idle", error: null };
    },
    clearDeleteNotificationState: (state) => {
      state.deleteNotification = { status: "idle", error: null };
    },
  },
  extraReducers: (builder) => {
    // Get Notifications
    builder.addCase(getNotifications.pending, (state) => {
      handlePending(state, "getNotifications");
    });
    builder.addCase(getNotifications.fulfilled, (state, action) => {
      state.getNotifications.status = "succeeded";
      state.records = action.payload.data;
    });
    builder.addCase(getNotifications.rejected, (state, action) => {
      handleRejected(state, "getNotifications", action);
    });

    // Mark Notification As Read
    builder.addCase(markNotificationAsRead.pending, (state) => {
      handlePending(state, "markNotificationAsRead");
    });
    builder.addCase(markNotificationAsRead.fulfilled, (state, action) => {
      state.markNotificationAsRead.status = "succeeded";
      const index = state.records.findIndex(
        (record) => record._id === action.meta.arg,
      );
      if (index !== -1) {
        state.records.splice(index, 1, action.payload.data);
      }
    });
    builder.addCase(markNotificationAsRead.rejected, (state, action) => {
      handleRejected(state, "markNotificationAsRead", action);
    });

    // Delete Notification
    builder.addCase(deleteNotification.pending, (state) => {
      handlePending(state, "deleteNotification");
    });
    builder.addCase(deleteNotification.fulfilled, (state, action) => {
      state.deleteNotification.status = "succeeded";
      state.records = state.records.filter(
        (record) => record._id !== action.meta.arg,
      );
    });
    builder.addCase(deleteNotification.rejected, (state, action) => {
      handleRejected(state, "deleteNotification", action);
    });
  },
});

export const {
  clearMarkNotificationAsReadState,
  clearDeleteNotificationState,
  clearGetNotificationsState,
} = notificationsSlice.actions;

export { getNotifications, markNotificationAsRead, deleteNotification };

export default notificationsSlice.reducer;
