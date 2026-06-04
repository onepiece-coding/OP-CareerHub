/**
 * @file src/store/admin/actions/get-all-Info.ts
 */

import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosErrorHandler } from "@/lib/utils";
import type { AllInfo } from "@/lib/types";

import api from "@/services/api-service";

type TResponse = AllInfo;

const getAllInfo = createAsyncThunk("admin/getAllInfo", async (_, thunk) => {
  const { fulfillWithValue, rejectWithValue, signal } = thunk;
  try {
    const response = await api.get<TResponse>(`/admin/info`, { signal });
    return fulfillWithValue(response.data);
  } catch (error) {
    if (import.meta.env.MODE === "development") {
      console.error("Get All Info:", error);
    }
    return rejectWithValue(axiosErrorHandler(error));
  }
});

export default getAllInfo;
