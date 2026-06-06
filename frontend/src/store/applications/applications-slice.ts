/**
 * @file src/store/applications/applications-slice.ts
 */

import type { QuerySchema } from "./actions/get-candidate-applications";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Application, OperationState } from "@/lib/types";
import { handlePending, handleRejected } from "@/lib/utils";

import getRecruiterJobsApplications from "./actions/get-recruiter-jobs-applications";
import getCandidateApplications from "./actions/get-candidate-applications";
import updateApplicationStatus from "./actions/update-application-status";
import applyInJob from "./actions/apply-in-job";

interface UserApplicationsCacheData {
  candidateApplications: Application[];
  totalPages: number;
}

interface RecruiterApplicationsCacheData {
  recruiterJobsApplications: Application[];
  totalPages: number;
}

interface ApplicationState {
  getRecruiterJobsApplications: OperationState;
  getCandidateApplications: OperationState;
  updateApplicationStatus: OperationState;
  applyInJob: OperationState;

  recruiterApplicationsCache: Record<string, RecruiterApplicationsCacheData>;
  userApplicationsCache: Record<string, UserApplicationsCacheData>;
  currentQueryKeyForRecruiterApplicationsCache: string;
  currentQueryKeyForUserApplicationsCache: string;
}

const initialState: ApplicationState = {
  getRecruiterJobsApplications: { status: "idle", error: null },
  getCandidateApplications: { status: "idle", error: null },
  updateApplicationStatus: { status: "idle", error: null },
  applyInJob: { status: "idle", error: null },

  currentQueryKeyForRecruiterApplicationsCache: "",
  currentQueryKeyForUserApplicationsCache: "",
  recruiterApplicationsCache: {},
  userApplicationsCache: {},
};

export const getCacheKey = (query: QuerySchema) => {
  if (query._id) {
    return `${query.page}-${query.limit}-${query._id}`;
  } else {
    return `${query.page}-${query.limit}`;
  }
};

const applicationsSlice = createSlice({
  name: "applications",
  initialState,
  reducers: {
    clearApplyInJobState: (state) => {
      state.applyInJob = { status: "idle", error: null };
    },
    clearGetRecruiterJobsApplicationsState: (state) => {
      state.getRecruiterJobsApplications = { status: "idle", error: null };
    },
    clearUpdateApplicationStatusState: (state) => {
      state.updateApplicationStatus = { status: "idle", error: null };
    },
    clearGetCandidateApplicationsState: (state) => {
      state.getCandidateApplications = { status: "idle", error: null };
    },

    // New reducer to sync the active UI query with the store
    setCurrentQueryKeyForUserApplicationsCache: (
      state,
      action: PayloadAction<QuerySchema>,
    ) => {
      const key = getCacheKey(action.payload); // 1
      state.currentQueryKeyForUserApplicationsCache = key; // 1-

      // If data is already cached, set status to succeeded immediately
      // so the UI bypasses the loading spinner.
      if (state.userApplicationsCache[key]) {
        state.getCandidateApplications.status = "succeeded";
        state.getCandidateApplications.error = null;
      } else {
        state.getCandidateApplications.status = "idle";
      }
    },

    setCurrentQueryKeyForRecruiterApplicationsCache: (
      state,
      action: PayloadAction<QuerySchema>,
    ) => {
      const key = getCacheKey(action.payload); // 1
      state.currentQueryKeyForRecruiterApplicationsCache = key; // 1-

      // If data is already cached, set status to succeeded immediately
      // so the UI bypasses the loading spinner.
      if (state.recruiterApplicationsCache[key]) {
        state.getRecruiterJobsApplications.status = "succeeded";
        state.getRecruiterJobsApplications.error = null;
      } else {
        state.getRecruiterJobsApplications.status = "idle";
      }
    },
  },

  extraReducers: (builder) => {
    // Apply In Job
    builder.addCase(applyInJob.pending, (state) => {
      handlePending(state, "applyInJob");
    });
    builder.addCase(applyInJob.fulfilled, (state) => {
      state.applyInJob.status = "succeeded";
    });
    builder.addCase(applyInJob.rejected, (state, action) => {
      handleRejected(state, "applyInJob", action);
    });

    // Get Recruiter Jobs Applications
    builder.addCase(getRecruiterJobsApplications.pending, (state) => {
      handlePending(state, "getRecruiterJobsApplications");
    });
    builder.addCase(getRecruiterJobsApplications.fulfilled, (state, action) => {
      state.getRecruiterJobsApplications.status = "succeeded";

      // Store the newly fetched data in our cache using the requested arguments
      const key = getCacheKey(action.meta.arg);
      state.recruiterApplicationsCache[key] = {
        totalPages: action.payload.pagination.totalPages,
        recruiterJobsApplications: action.payload.data,
      };
      state.currentQueryKeyForRecruiterApplicationsCache = key;
    });
    builder.addCase(getRecruiterJobsApplications.rejected, (state, action) => {
      handleRejected(state, "getRecruiterJobsApplications", action);
    });

    // Update Application Status
    builder.addCase(updateApplicationStatus.pending, (state) => {
      handlePending(state, "updateApplicationStatus");
    });
    builder.addCase(updateApplicationStatus.fulfilled, (state, action) => {
      state.updateApplicationStatus.status = "succeeded";

      const key = state.currentQueryKeyForRecruiterApplicationsCache;
      const recruiterJobsApplications =
        state.recruiterApplicationsCache[key].recruiterJobsApplications;

      const index = recruiterJobsApplications.findIndex(
        (app) => app._id === action.meta.arg.applicationId,
      );
      if (index !== -1) {
        recruiterJobsApplications.splice(index, 1, action.payload.data);
      }
    });
    builder.addCase(updateApplicationStatus.rejected, (state, action) => {
      handleRejected(state, "updateApplicationStatus", action);
    });

    // Get Candidate Applications
    builder.addCase(getCandidateApplications.pending, (state) => {
      handlePending(state, "getCandidateApplications");
    });
    builder.addCase(getCandidateApplications.fulfilled, (state, action) => {
      state.getCandidateApplications.status = "succeeded";

      // Store the newly fetched data in our cache using the requested arguments
      const key = getCacheKey(action.meta.arg);
      state.userApplicationsCache[key] = {
        totalPages: action.payload.pagination.totalPages,
        candidateApplications: action.payload.data,
      };
      state.currentQueryKeyForUserApplicationsCache = key;
    });
    builder.addCase(getCandidateApplications.rejected, (state, action) => {
      handleRejected(state, "getCandidateApplications", action);
    });
  },
});

export const {
  setCurrentQueryKeyForRecruiterApplicationsCache,
  setCurrentQueryKeyForUserApplicationsCache,
  clearGetRecruiterJobsApplicationsState,
  clearGetCandidateApplicationsState,
  clearUpdateApplicationStatusState,
  clearApplyInJobState,
} = applicationsSlice.actions;

export {
  getRecruiterJobsApplications,
  getCandidateApplications,
  updateApplicationStatus,
  applyInJob,
};

export default applicationsSlice.reducer;
