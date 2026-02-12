import { useState } from "react";
import { axiosErrorHandler } from "../../../api/axiosErrorHandler";
import { axiosInstance } from "../../../api/axiosInstance";
import { toast } from "react-toastify";

const useJobItem = (status, jobId) => {
  const [loading, setLoading] = useState(false);

  const handleApplyJob = async () => {
    if (!status) {
      toast.info("Login First!");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axiosInstance.post("/api/v1/applications/apply", {
        jobId,
      });
      toast.success(data?.message);
    } catch (error) {
      toast.error(axiosErrorHandler(error));
    } finally {
      setLoading(false);
    }
  };

  return { handleApplyJob, loading };
};

export default useJobItem;
