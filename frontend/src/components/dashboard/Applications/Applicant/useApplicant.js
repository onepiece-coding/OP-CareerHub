import { useCallback, useEffect, useState } from "react";
import { axiosInstance } from "../../../../api/axiosInstance";
import { axiosErrorHandler } from "../../../../api/axiosErrorHandler";

const useApplicant = () => {
  const [state, setState] = useState({
    data: [],
    pagination: { totalPages: 0 },
    total: 0,
    loading: false,
    error: null,
    currentPage: 1,
  });

  const getCandidateAppliedJobs = useCallback(async (page = 1) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await axiosInstance.get(
        `/api/v1/applications/applicant-jobs?page=${page}`
      );

      setState((prev) => ({
        ...prev,
        ...response.data,
        currentPage: page,
        loading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: axiosErrorHandler(error),
        loading: false,
      }));
    }
  }, []);

  useEffect(() => {
    getCandidateAppliedJobs();
  }, [getCandidateAppliedJobs]);

  return { state, getCandidateAppliedJobs };
};

export default useApplicant;
