/**
 * @file src/store/applications/applications-selectors.ts
 */

import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "..";

export const selectApplications = (state: RootState) => state.applications;

export const selectApplyInJobStatus = (state: RootState) =>
  state.applications.applyInJob.status;

export const selectApplyInJobError = (state: RootState) =>
  state.applications.applyInJob.error;

export const selectGetRecruiterJobsApplicationsStatus = (state: RootState) =>
  state.applications.getRecruiterJobsApplications.status;

export const selectGetRecruiterJobsApplicationsError = (state: RootState) =>
  state.applications.getRecruiterJobsApplications.error;

export const selectRecruiterJobsApplications = (state: RootState) =>
  state.applications.recruiterJobsApplications;

export const selectUpdateApplicationStatusStatus = (state: RootState) =>
  state.applications.updateApplicationStatus.status;

export const selectUpdateApplicationStatusError = (state: RootState) =>
  state.applications.updateApplicationStatus.error;

export const selectGetCandidateApplicationsStatus = (state: RootState) =>
  state.applications.getCandidateApplications.status;

export const selectGetCandidateApplicationsError = (state: RootState) =>
  state.applications.getCandidateApplications.error;

export const selectGetCandidateApplicationsTotalPages = (state: RootState) => {
  const { cache, currentQueryKey } = state.applications;
  return cache[currentQueryKey]?.totalPages || 0;
};

export const selectGetCandidateApplicationsRecords = createSelector(
  [selectApplications],
  (applications) => {
    const { cache, currentQueryKey } = applications;
    return cache[currentQueryKey]?.candidateApplications || [];
  },
);
