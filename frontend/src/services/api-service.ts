/**
 * @file src/services/api-service.ts
 */

import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { logoutUser } from "@/store/auth/auth-slice";

const api = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://localhost:8000/api/v1"
      : "https://op-careerhub-backend.onrender.com/api/v1",
  withCredentials: true,
});

let isRefreshing = false;

interface QueueEntry {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}

let failedQueue: QueueEntry[] = [];

// Helper to process the queue
const processQueue = (error: unknown) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(null);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      // If a refresh is already in progress, add this request to the queue
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        isRefreshing = false;
        processQueue(null); // Resolve all pending requests
        return api(originalRequest); // Retry the original request
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError); // Reject all pending requests

        const { store } = await import("@/store");
        store.dispatch(logoutUser());

        if (!window.location.pathname.includes("/auth/login")) {
          window.location.href = "/auth/login";
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
