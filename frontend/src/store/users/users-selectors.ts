/**
 * @file src/store/users/users-selectors.ts
 */

import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "..";

export const selectUsers = (state: RootState) => state.users;

export const selectUpdateProfilePhotoStatus = (state: RootState) =>
  state.users.updateProfilePhoto.status;

export const selectUpdateProfilePhotoError = (state: RootState) =>
  state.users.updateProfilePhoto.error;

export const selectUpdateUserProfileStatus = (state: RootState) =>
  state.users.updateUserProfile.status;

export const selectUpdateUserProfileError = (state: RootState) =>
  state.users.updateUserProfile.error;

export const selectGetAllUsersStatus = (state: RootState) =>
  state.users.getAllUsers.status;

export const selectGetAllUsersError = (state: RootState) =>
  state.users.getAllUsers.error;

export const selectGetAllUsersTotalPages = (state: RootState) => {
  const { cache, currentQueryKey } = state.users;
  return cache[currentQueryKey]?.totalPages || 0;
};

export const selectGetAllUsersRecords = createSelector(
  [selectUsers],
  (users) => {
    const { cache, currentQueryKey } = users;
    return cache[currentQueryKey]?.users || [];
  },
);

// export const selectGetAllUsersRecords = (state: RootState) => {
//   const { cache, currentQueryKey } = state.users;
//   return cache[currentQueryKey]?.users || [];
// };

export const selectDeleteUserStatus = (state: RootState) =>
  state.users.deleteUser.status;

export const selectDeleteUserError = (state: RootState) =>
  state.users.deleteUser.error;

export const selectDeleteAllUsersStatus = (state: RootState) =>
  state.users.deleteAllUsers.status;

export const selectDeleteAllUsersError = (state: RootState) =>
  state.users.deleteAllUsers.error;

export const selectResumeUploadStatus = (state: RootState) =>
  state.users.resumeUpload.status;

export const selectResumeUploadError = (state: RootState) =>
  state.users.resumeUpload.error;
