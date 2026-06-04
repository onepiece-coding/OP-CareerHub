/**
 * @file src/store/notifications/notifications-selectors.ts
 */

import type { RootState } from "..";

export const selectNotifications = (state: RootState) => state.notifications;

export const selectGetNotificationsStatus = (state: RootState) =>
  state.notifications.getNotifications.status;

export const selectGetNotificationsError = (state: RootState) =>
  state.notifications.getNotifications.error;

export const selectMarkNotificationAsReadStatus = (state: RootState) =>
  state.notifications.markNotificationAsRead.status;

export const selectMarkNotificationAsReadError = (state: RootState) =>
  state.notifications.markNotificationAsRead.error;

export const selectDeleteNotificationStatus = (state: RootState) =>
  state.notifications.deleteNotification.status;

export const selectDeleteNotificationError = (state: RootState) =>
  state.notifications.deleteNotification.error;

export const selectRecords = (state: RootState) => state.notifications.records;
