/**
 * @file src/store/jobs/jobs-slice.ts
 */

import getRecruiterJobs from "./actions/get-recruiter-jobs";
import { handlePending, handleRejected } from "@/lib/utils";
import type { Job, OperationState } from "@/lib/types";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import deleteRecruiterJob from "./actions/delete-recruiter-job";
import updateSingleJob from "./actions/update-single-job";
import getSingleJob from "./actions/get-single-job";
import getAllJobs, { type QuerySchema } from "./actions/get-all-jobs";
import addJob from "./actions/add-job";

interface CacheData {
  allJobs: Job[];
  totalPages: number;
}

interface JobsState {
  deleteRecruiterJob: OperationState;
  getRecruiterJobs: OperationState;
  updateSingleJob: OperationState;
  getSingleJob: OperationState;
  getAllJobs: OperationState;
  addJob: OperationState;

  singleJob: Job | null;
  recruiterJobs: Job[];
  totalPages: number;
  allJobs: Job[];

  cache: Record<string, CacheData>;
  currentQueryKey: string;
}

const initialState: JobsState = {
  deleteRecruiterJob: { status: "idle", error: null },
  getRecruiterJobs: { status: "idle", error: null },
  updateSingleJob: { status: "idle", error: null },
  getSingleJob: { status: "idle", error: null },
  getAllJobs: { status: "idle", error: null },
  addJob: { status: "idle", error: null },

  recruiterJobs: [],
  singleJob: null,
  totalPages: 0,
  allJobs: [],

  cache: {},
  currentQueryKey: "",
};

export const getCacheKey = (query: QuerySchema) =>
  `${query.page}-${query.limit}-${query.search}-${query.sort}-${query.jobStatus}-${query.jobType}`;

const jobsSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    clearAddJobState: (state) => {
      state.addJob = { status: "idle", error: null };
    },
    clearGetRecruiterJobsState: (state) => {
      state.getRecruiterJobs = { status: "idle", error: null };
    },
    clearDeleteRecruiterJobState: (state) => {
      state.deleteRecruiterJob = { status: "idle", error: null };
    },
    clearGetSingleJobState: (state) => {
      state.getSingleJob = { status: "idle", error: null };
    },
    clearUpdateSingleJobState: (state) => {
      state.updateSingleJob = { status: "idle", error: null };
    },
    clearSingleJob: (state) => {
      state.singleJob = null;
    },
    clearGetAllJobsState: (state) => {
      state.getAllJobs = { status: "idle", error: null };
    },

    setCurrentQuery: (state, action: PayloadAction<QuerySchema>) => {
      const key = getCacheKey(action.payload);
      state.currentQueryKey = key;

      if (state.cache[key]) {
        state.getAllJobs.status = "succeeded";
        state.getAllJobs.error = null;
      } else {
        state.getAllJobs.status = "idle";
      }
    },
  },
  extraReducers: (builder) => {
    // Add Job
    builder.addCase(addJob.pending, (state) => {
      handlePending(state, "addJob");
    });
    builder.addCase(addJob.fulfilled, (state, action) => {
      state.addJob.status = "succeeded";
      state.recruiterJobs.push(action.payload.result);
    });
    builder.addCase(addJob.rejected, (state, action) => {
      handleRejected(state, "addJob", action);
    });

    // Get Recruiter Jobs
    builder.addCase(getRecruiterJobs.pending, (state) => {
      handlePending(state, "getRecruiterJobs");
    });
    builder.addCase(getRecruiterJobs.fulfilled, (state, action) => {
      state.getRecruiterJobs.status = "succeeded";
      state.recruiterJobs = action.payload.data;
    });
    builder.addCase(getRecruiterJobs.rejected, (state, action) => {
      handleRejected(state, "getRecruiterJobs", action);
    });

    // Delete Recruiter Job
    builder.addCase(deleteRecruiterJob.pending, (state) => {
      handlePending(state, "deleteRecruiterJob");
    });
    builder.addCase(deleteRecruiterJob.fulfilled, (state, action) => {
      state.deleteRecruiterJob.status = "succeeded";
      state.recruiterJobs = state.recruiterJobs.filter(
        (job) => job._id !== action.meta.arg,
      );
    });
    builder.addCase(deleteRecruiterJob.rejected, (state, action) => {
      handleRejected(state, "deleteRecruiterJob", action);
    });

    // Get Single Job
    builder.addCase(getSingleJob.pending, (state) => {
      handlePending(state, "getSingleJob");
    });
    builder.addCase(getSingleJob.fulfilled, (state, action) => {
      state.getSingleJob.status = "succeeded";
      state.singleJob = action.payload.result;
    });
    builder.addCase(getSingleJob.rejected, (state, action) => {
      handleRejected(state, "getSingleJob", action);
    });

    // Update Single Job
    builder.addCase(updateSingleJob.pending, (state) => {
      handlePending(state, "updateSingleJob");
    });
    builder.addCase(updateSingleJob.fulfilled, (state, action) => {
      state.updateSingleJob.status = "succeeded";
      const index = state.recruiterJobs.findIndex(
        (job) => job._id === action.meta.arg.jobId,
      );
      if (index !== -1) {
        state.recruiterJobs.splice(index, 1, action.payload.result);
      }
    });
    builder.addCase(updateSingleJob.rejected, (state, action) => {
      handleRejected(state, "updateSingleJob", action);
    });

    // Get All Jobs
    builder.addCase(getAllJobs.pending, (state) => {
      handlePending(state, "getAllJobs");
    });
    builder.addCase(getAllJobs.fulfilled, (state, action) => {
      state.getAllJobs.status = "succeeded";

      // Store the newly fetched data in our cache using the requested arguments
      const key = getCacheKey(action.meta.arg);
      state.cache[key] = {
        totalPages: action.payload.pagination.totalPages,
        allJobs: action.payload.data,
      };
      state.currentQueryKey = key;
    });
    builder.addCase(getAllJobs.rejected, (state, action) => {
      handleRejected(state, "getAllJobs", action);
    });
  },
});

export const {
  clearDeleteRecruiterJobState,
  clearGetRecruiterJobsState,
  clearUpdateSingleJobState,
  clearGetSingleJobState,
  clearGetAllJobsState,
  clearAddJobState,
  setCurrentQuery,
  clearSingleJob,
} = jobsSlice.actions;

export {
  deleteRecruiterJob,
  getRecruiterJobs,
  updateSingleJob,
  getSingleJob,
  getAllJobs,
  addJob,
};

export default jobsSlice.reducer;
