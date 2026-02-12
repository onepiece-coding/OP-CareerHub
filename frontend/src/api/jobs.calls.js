import { axiosInstance } from "./axiosInstance";

export const jobsApi = {
  getAll: async (params) => {
    const queryParams = new URLSearchParams();
    queryParams.append("page", params.page);
    if (params.type) queryParams.append("jobType", params.type);
    if (params.status) queryParams.append("jobStatus", params.status);
    if (params.sortBy) queryParams.append("sort", params.sortBy);
    if (params.searchTerm) queryParams.append("search", params.searchTerm);
    return axiosInstance.get(`/api/v1/jobs?${queryParams}`);
  },
};
