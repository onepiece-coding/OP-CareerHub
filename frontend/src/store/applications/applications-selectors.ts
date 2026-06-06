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

export const selectUpdateApplicationStatusStatus = (state: RootState) =>
  state.applications.updateApplicationStatus.status;

export const selectUpdateApplicationStatusError = (state: RootState) =>
  state.applications.updateApplicationStatus.error;

export const selectGetCandidateApplicationsStatus = (state: RootState) =>
  state.applications.getCandidateApplications.status;

export const selectGetCandidateApplicationsError = (state: RootState) =>
  state.applications.getCandidateApplications.error;

export const selectGetCandidateApplicationsTotalPages = (state: RootState) => {
  const { userApplicationsCache, currentQueryKeyForUserApplicationsCache } =
    state.applications;
  return (
    userApplicationsCache[currentQueryKeyForUserApplicationsCache]
      ?.totalPages || 0
  );
};

export const selectGetRecruiterApplicationsTotalPages = (state: RootState) => {
  const {
    recruiterApplicationsCache,
    currentQueryKeyForRecruiterApplicationsCache,
  } = state.applications;
  return (
    recruiterApplicationsCache[currentQueryKeyForRecruiterApplicationsCache]
      ?.totalPages || 0
  );
};

export const selectGetCandidateApplicationsRecords = createSelector(
  [selectApplications],
  (applications) => {
    const { userApplicationsCache, currentQueryKeyForUserApplicationsCache } =
      applications;
    return (
      userApplicationsCache[currentQueryKeyForUserApplicationsCache]
        ?.candidateApplications || []
    );
  },
);

export const selectGetRecruiterApplicationsRecords = createSelector(
  [selectApplications],
  (applications) => {
    const {
      recruiterApplicationsCache,
      currentQueryKeyForRecruiterApplicationsCache,
    } = applications;
    return (
      recruiterApplicationsCache[currentQueryKeyForRecruiterApplicationsCache]
        ?.recruiterJobsApplications || []
    );
  },
);
