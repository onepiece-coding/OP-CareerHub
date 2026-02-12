import { useCallback, useEffect, useState } from "react";
import { axiosInstance } from "../../../api/axiosInstance";
import { axiosErrorHandler } from "../../../api/axiosErrorHandler";

const useStats = () => {
  const [state, setState] = useState({
    defaultStats: [],
    monthly_stats: [],
    loading: false,
    error: null,
    isShowBarChart: false,
  });

  const getMonthlyStats = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const { data } = await axiosInstance.get(`/api/v1/admin/stats`);

      console.log(data.defaultStats, data.monthly_stats);

      setState((prev) => ({
        ...prev,
        defaultStats: data.defaultStats,
        monthly_stats: data.monthly_stats,
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

  const setIsShowBarChart = () => {
    setState((prev) => ({ ...prev, isShowBarChart: !prev.isShowBarChart }));
  };

  useEffect(() => {
    getMonthlyStats();
  }, [getMonthlyStats]);

  return { state, setIsShowBarChart };
};

export default useStats;
