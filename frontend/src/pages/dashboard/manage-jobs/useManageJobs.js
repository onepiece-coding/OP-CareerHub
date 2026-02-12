import { useCallback, useEffect, useState } from "react";
import { axiosErrorHandler } from "../../../api/axiosErrorHandler";
import { axiosInstance } from "../../../api/axiosInstance";
import { toast } from "react-toastify";

const useManageJobs = () => {
  const [state, setState] = useState({
    data: [],
    loading: false,
    error: null,
  });

  const fetchRecruiterJobs = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const { data: jobs } = await axiosInstance.get("/api/v1/jobs/my-jobs");
      setState((prev) => ({
        ...prev,
        data: jobs?.data,
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

  const deleteSingleJob = useCallback(
    async (jobId) => {
      if (confirm("Êtes-vous sûr de vouloir supprimer ce travail?")) {
        try {
          const { data } = await axiosInstance.delete(`/api/v1/jobs/${jobId}`);
          toast.success(data.message);
          fetchRecruiterJobs();
        } catch (error) {
          toast.error(axiosErrorHandler(error));
        }
      }
    },
    [fetchRecruiterJobs]
  );

  useEffect(() => {
    fetchRecruiterJobs();
  }, [fetchRecruiterJobs]);

  return { state, fetchRecruiterJobs, deleteSingleJob };
};

export default useManageJobs;
