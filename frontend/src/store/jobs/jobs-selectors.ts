/**
 * @file src/store/jobs/jobs-selectors.ts
 */

import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "..";

export const selectJobsState = (state: RootState) => state.jobs;

export const selectAddJobStatus = (state: RootState) =>
  state.jobs.addJob.status;

export const selectAddJobError = (state: RootState) => state.jobs.addJob.error;

export const selectGetRecruiterJobsStatus = (state: RootState) =>
  state.jobs.getRecruiterJobs.status;

export const selectGetRecruiterJobsError = (state: RootState) =>
  state.jobs.getRecruiterJobs.error;

export const selectRecruiterJobs = (state: RootState) =>
  state.jobs.recruiterJobs;

export const selectDeleteRecruiterJobStatus = (state: RootState) =>
  state.jobs.deleteRecruiterJob.status;

export const selectDeleteRecruiterJobError = (state: RootState) =>
  state.jobs.deleteRecruiterJob.error;

export const selectGetSingleJobStatus = (state: RootState) =>
  state.jobs.getSingleJob.status;

export const selectGetSingleJobError = (state: RootState) =>
  state.jobs.getSingleJob.error;

export const selectUpdateSingleJobStatus = (state: RootState) =>
  state.jobs.updateSingleJob.status;

export const selectUpdateSingleJobError = (state: RootState) =>
  state.jobs.updateSingleJob.error;

export const selectSingleJob = (state: RootState) => state.jobs.singleJob;

export const selectGetAllJobsStatus = (state: RootState) =>
  state.jobs.getAllJobs.status;

export const selectGetAllJobsError = (state: RootState) =>
  state.jobs.getAllJobs.error;

export const selectTotalPages = (state: RootState) => {
  const { cache, currentQueryKey } = state.jobs;
  return cache[currentQueryKey]?.totalPages || 0;
};

export const selectAllJobs = createSelector([selectJobsState], (jobs) => {
  const { cache, currentQueryKey } = jobs;
  return cache[currentQueryKey]?.allJobs || [];
});
