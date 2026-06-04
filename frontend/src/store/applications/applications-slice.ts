/**
 * @file src/store/applications/applications-slice.ts
 */

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Application, OperationState } from "@/lib/types";
import { handlePending, handleRejected } from "@/lib/utils";

import getRecruiterJobsApplications from "./actions/get-recruiter-jobs-applications";
import getCandidateApplications from "./actions/get-candidate-applications";
import updateApplicationStatus from "./actions/update-application-status";
import type { QuerySchema } from "./actions/get-candidate-applications";
import applyInJob from "./actions/apply-in-job";

interface CacheData {
  candidateApplications: Application[];
  totalPages: number;
}

interface ApplicationState {
  getRecruiterJobsApplications: OperationState;
  getCandidateApplications: OperationState;
  updateApplicationStatus: OperationState;
  applyInJob: OperationState;

  recruiterJobsApplications: Application[];

  cache: Record<string, CacheData>;
  currentQueryKey: string;
}

const initialState: ApplicationState = {
  getRecruiterJobsApplications: { status: "idle", error: null },
  getCandidateApplications: { status: "idle", error: null },
  updateApplicationStatus: { status: "idle", error: null },
  applyInJob: { status: "idle", error: null },

  recruiterJobsApplications: [],

  cache: {},
  currentQueryKey: "",
};

export const getCacheKey = (query: QuerySchema) =>
  `${query.page}-${query.limit}`;

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
    setCurrentQuery: (state, action: PayloadAction<QuerySchema>) => {
      const key = getCacheKey(action.payload); // 1
      state.currentQueryKey = key; // 1-

      // If data is already cached, set status to succeeded immediately
      // so the UI bypasses the loading spinner.
      if (state.cache[key]) {
        state.getCandidateApplications.status = "succeeded";
        state.getCandidateApplications.error = null;
      } else {
        state.getCandidateApplications.status = "idle";
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
      state.recruiterJobsApplications = action.payload.result;
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
      const index = state.recruiterJobsApplications.findIndex(
        (app) => app._id === action.meta.arg.applicationId,
      );
      if (index !== -1) {
        state.recruiterJobsApplications.splice(index, 1, action.payload.data);
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
      state.cache[key] = {
        totalPages: action.payload.pagination.totalPages,
        candidateApplications: action.payload.data,
      };
      state.currentQueryKey = key;
    });
    builder.addCase(getCandidateApplications.rejected, (state, action) => {
      handleRejected(state, "getCandidateApplications", action);
    });
  },
});

export const {
  clearGetRecruiterJobsApplicationsState,
  clearGetCandidateApplicationsState,
  clearUpdateApplicationStatusState,
  clearApplyInJobState,
  setCurrentQuery,
} = applicationsSlice.actions;

export {
  getRecruiterJobsApplications,
  getCandidateApplications,
  updateApplicationStatus,
  applyInJob,
};

export default applicationsSlice.reducer;
