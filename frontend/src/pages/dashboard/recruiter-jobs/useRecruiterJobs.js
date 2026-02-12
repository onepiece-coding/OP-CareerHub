import { useCallback, useEffect, useState } from "react";
import { axiosInstance } from "../../../api/axiosInstance";
import { axiosErrorHandler } from "../../../api/axiosErrorHandler";
import { toast } from "react-toastify";

const useRecruiterJobs = (jobId) => {
  const [state, setState] = useState({
    data: [],
    loading: false,
    error: null,
    open: false,
    score: 0,
    reasons: [],
    applicationId: null,
  });

  const getRecruiterPostJobs = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const { data } = await axiosInstance.get(
        `/api/v1/applications/ai-filter/${jobId}`
      );

      setState((prev) => ({
        ...prev,
        data: data.data,
        loading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: axiosErrorHandler(error),
        loading: false,
      }));
    }
  }, [jobId]);

  const updateApplicationStatus = useCallback(
    async (status) => {
      try {
        const { data } = await axiosInstance.patch(
          `/api/v1/applications/${state.applicationId}`,
          { status, jobId }
        );
        toast.success(data.message);
        getRecruiterPostJobs();
      } catch (error) {
        toast.error(axiosErrorHandler(error));
      }
    },
    [getRecruiterPostJobs, jobId, state.applicationId]
  );

  const aiAnalysis = useCallback((score, reasons, applicationId) => {
    setState((prev) => ({
      ...prev,
      open: true,
      score,
      reasons,
      applicationId,
    }));
  }, []);

  const closeModal = useCallback(() => {
    setState((prev) => ({ ...prev, open: false }));
  }, []);

  useEffect(() => {
    getRecruiterPostJobs();
  }, [getRecruiterPostJobs]);

  return { state, updateApplicationStatus, aiAnalysis, closeModal };
};

export default useRecruiterJobs;
