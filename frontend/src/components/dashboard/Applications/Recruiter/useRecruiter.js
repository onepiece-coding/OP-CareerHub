import { useCallback, useEffect, useState } from "react";
import { axiosInstance } from "../../../../api/axiosInstance";
import { axiosErrorHandler } from "../../../../api/axiosErrorHandler";
import { toast } from "react-toastify";

const useRecruiter = () => {
  const [state, setState] = useState({
    data: [],
    loading: false,
    error: null,
  });

  const getRecruiterPostJobs = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const { data } = await axiosInstance.get(
        "/api/v1/applications/recruiter-jobs"
      );

      setState((prev) => ({
        ...prev,
        data: data.result,
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

  const updateApplicationStatus = useCallback(
    async (applicationId, status, jobId) => {
      try {
        const { data } = await axiosInstance.patch(
          `/api/v1/applications/${applicationId}`,
          { status, jobId }
        );
        toast.success(data.message);
        getRecruiterPostJobs();
      } catch (error) {
        toast.error(axiosErrorHandler(error));
      }
    },
    [getRecruiterPostJobs]
  );

  useEffect(() => {
    getRecruiterPostJobs();
  }, [getRecruiterPostJobs]);

  return { state, updateApplicationStatus };
};

export default useRecruiter;
