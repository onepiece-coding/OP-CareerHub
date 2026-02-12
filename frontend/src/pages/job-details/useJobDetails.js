import { useEffect, useState } from "react";
import { axiosErrorHandler } from "../../api/axiosErrorHandler";
import { axiosInstance } from "../../api/axiosInstance";

const useJobDetails = (jobId) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [jobDetails, setJobDetails] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      try {
        const { data } = await axiosInstance.get(`/api/v1/jobs/${jobId}`);
        setJobDetails(data?.result);
      } catch (error) {
        setError(axiosErrorHandler(error));
      } finally {
        setLoading(false);
      }
    };
    if (jobId) fetchJob();
  }, [jobId]);

  return { loading, error, jobDetails };
};

export default useJobDetails;
