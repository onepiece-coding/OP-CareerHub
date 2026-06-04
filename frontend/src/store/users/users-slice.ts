/**
 * @file src/store/users/users-slice.ts
 */

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type OperationState, type User } from "@/lib/types";
import { handlePending, handleRejected } from "@/lib/utils";
import { updateUserRole } from "../admin/admin-slice";

import getAllUsers, { type QuerySchema } from "./actions/get-all-users";
import updateProfilePhoto from "./actions/update-profile-photo";
import updateUserProfile from "./actions/update-user-profile";
import deleteAllUsers from "./actions/delete-all-users";
import deleteUser from "./actions/delete-user";
import resumeUpload from "./actions/resume-upload";

interface CacheData {
  totalPages: number;
  users: User[];
}

interface UsersState {
  updateProfilePhoto: OperationState;
  updateUserProfile: OperationState;
  deleteAllUsers: OperationState;
  resumeUpload: OperationState;
  getAllUsers: OperationState;
  deleteUser: OperationState;

  cache: Record<string, CacheData>;
  currentQueryKey: string;
}

const initialState: UsersState = {
  updateProfilePhoto: { status: "idle", error: null },
  updateUserProfile: { status: "idle", error: null },
  deleteAllUsers: { status: "idle", error: null },
  resumeUpload: { status: "idle", error: null },
  getAllUsers: { status: "idle", error: null },
  deleteUser: { status: "idle", error: null },

  cache: {},
  currentQueryKey: "",
};

// Helper to reliably generate cache keys
export const getCacheKey = (query: QuerySchema) =>
  `${query.pageNumber}-${query.username}`;

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearUpdateProfilePhotoState: (state) => {
      state.updateProfilePhoto = { status: "idle", error: null };
    },
    clearResumeUploadState: (state) => {
      state.resumeUpload = { status: "idle", error: null };
    },
    clearUpdateUserProfileState: (state) => {
      state.updateUserProfile = { status: "idle", error: null };
    },
    clearGetAllUsersState: (state) => {
      state.getAllUsers = { status: "idle", error: null };
    },
    clearDeleteUserState: (state) => {
      state.deleteUser = { status: "idle", error: null };
    },
    clearDeleteAllUsersState: (state) => {
      state.deleteAllUsers = { status: "idle", error: null };
    },
    // New reducer to sync the active UI query with the store
    setCurrentQuery: (state, action: PayloadAction<QuerySchema>) => {
      const key = getCacheKey(action.payload); // 1-
      state.currentQueryKey = key; // 1-

      // If data is already cached, set status to succeeded immediately
      // so the UI bypasses the loading spinner.
      if (state.cache[key]) {
        state.getAllUsers.status = "succeeded";
        state.getAllUsers.error = null;
      } else {
        state.getAllUsers.status = "idle";
      }
    },
  },
  extraReducers: (builder) => {
    // Update Profile Photo
    builder.addCase(updateProfilePhoto.pending, (state) => {
      handlePending(state, "updateProfilePhoto");
    });
    builder.addCase(updateProfilePhoto.fulfilled, (state) => {
      state.updateProfilePhoto.status = "succeeded";
    });
    builder.addCase(updateProfilePhoto.rejected, (state, action) => {
      handleRejected(state, "updateProfilePhoto", action);
    });

    // Resume Upload
    builder.addCase(resumeUpload.pending, (state) => {
      handlePending(state, "resumeUpload");
    });
    builder.addCase(resumeUpload.fulfilled, (state) => {
      state.resumeUpload.status = "succeeded";
    });
    builder.addCase(resumeUpload.rejected, (state, action) => {
      handleRejected(state, "resumeUpload", action);
    });

    // Update User Profile
    builder.addCase(updateUserProfile.pending, (state) => {
      handlePending(state, "updateUserProfile");
    });
    builder.addCase(updateUserProfile.fulfilled, (state) => {
      state.updateUserProfile.status = "succeeded";
    });
    builder.addCase(updateUserProfile.rejected, (state, action) => {
      handleRejected(state, "updateUserProfile", action);
    });

    // Get All Users
    builder.addCase(getAllUsers.pending, (state) => {
      handlePending(state, "getAllUsers");
    });
    builder.addCase(getAllUsers.fulfilled, (state, action) => {
      state.getAllUsers.status = "succeeded";

      // Store the newly fetched data in our cache using the requested arguments
      const key = getCacheKey(action.meta.arg);
      state.cache[key] = {
        totalPages: action.payload.totalPages,
        users: action.payload.users,
      };
      state.currentQueryKey = key;
    });
    builder.addCase(getAllUsers.rejected, (state, action) => {
      handleRejected(state, "getAllUsers", action);
    });

    // Delete User
    builder.addCase(deleteUser.pending, (state) => {
      handlePending(state, "deleteUser");
    });
    builder.addCase(deleteUser.fulfilled, (state) => {
      state.deleteUser.status = "succeeded";

      // Deleting an item shifts pagination boundaries on the backend.
      // We MUST wipe the cache so the frontend doesn't show stale gaps
      // or incorrect totalPages.
      state.cache = {};
    });
    builder.addCase(deleteUser.rejected, (state, action) => {
      handleRejected(state, "deleteUser", action);
    });

    // Delete All Users
    builder.addCase(deleteAllUsers.pending, (state) => {
      handlePending(state, "deleteAllUsers");
    });
    builder.addCase(deleteAllUsers.fulfilled, (state) => {
      state.deleteAllUsers.status = "succeeded";

      // Deleting an item shifts pagination boundaries on the backend.
      // We MUST wipe the cache so the frontend doesn't show stale gaps
      // or incorrect totalPages.
      state.cache = {};
    });
    builder.addCase(deleteAllUsers.rejected, (state, action) => {
      handleRejected(state, "deleteAllUsers", action);
    });

    // Listen for the user role update from the other slice (admin)
    builder.addCase(updateUserRole.fulfilled, (state, action) => {
      const cached = state.cache[state.currentQueryKey];
      if (cached) {
        const user = cached.users.find((u) => u._id === action.meta.arg.id);
        if (user) user.role = action.payload.role;
      }

      // const key = state.currentQueryKey;
      // state.cache[key] = {
      //   totalPages: state.cache[key].totalPages,
      //   users: state.cache[key].users.map((user) => {
      //     if (user._id === action.meta.arg.id) {
      //       user.role = action.payload.role;
      //     }
      //     return user;
      //   }),
      // };
    });
  },
});

export const {
  clearUpdateProfilePhotoState,
  clearUpdateUserProfileState,
  clearDeleteAllUsersState,
  clearResumeUploadState,
  clearGetAllUsersState,
  clearDeleteUserState,
  setCurrentQuery,
} = usersSlice.actions;

export {
  updateProfilePhoto,
  updateUserProfile,
  deleteAllUsers,
  resumeUpload,
  getAllUsers,
  deleteUser,
};

export default usersSlice.reducer;
