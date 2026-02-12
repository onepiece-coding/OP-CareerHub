import { useState, useCallback, useMemo } from "react";
import { jobsApi } from "../api/jobs.calls"; // Centralized API config
import { JobsContext } from ".";
import { axiosErrorHandler } from "../api/axiosErrorHandler";

const JobsContextProvider = ({ children }) => {
  const [state, setState] = useState({
    data: [],
    pagination: { totalPages: 0 },
    total: 0,
    loading: false,
    error: null,
    currentPage: 1,
    filters: {
      type: "",
      status: "",
      sortBy: "",
      searchTerm: "",
    },
  });

  const fetchJobs = useCallback(async (page = 1, filters = {}) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await jobsApi.getAll({
        page,
        ...filters,
      });

      console.log(response);

      setState((prev) => ({
        ...prev,
        ...response.data,
        currentPage: page,
        filters,
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

  // memoization of context value
  const value = useMemo(
    () => ({
      ...state,
      fetchJobs,
      setFilters: (newFilters) => {
        fetchJobs(1, { ...state.filters, ...newFilters });
      },
    }),
    [state, fetchJobs]
  );

  return <JobsContext.Provider value={value}>{children}</JobsContext.Provider>;
};

export default JobsContextProvider;
