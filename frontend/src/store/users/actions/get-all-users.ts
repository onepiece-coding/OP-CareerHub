/**
 * @file src/store/users/actions/get-all-users.ts
 */

import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosErrorHandler } from "@/lib/utils";
import { getCacheKey } from "../users-slice";
import type { RootState } from "@/store";
import type { User } from "@/lib/types";

import api from "@/services/api-service";

type TResponse = {
  totalPages: number;
  users: User[];
};

export type QuerySchema = {
  pageNumber: number;
  username: string;
};

const getAllUsers = createAsyncThunk<
  TResponse,
  QuerySchema,
  { state: RootState } // Expose state type for the condition callback
>(
  "users/getAllUsers",
  async (querySchema: QuerySchema, thunk) => {
    const { fulfillWithValue, rejectWithValue, signal } = thunk;
    try {
      const response = await api.get<TResponse>(`/users`, {
        params: querySchema,
        signal,
      });
      return fulfillWithValue(response.data);
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Get All Users:", error);
      }
      return rejectWithValue(axiosErrorHandler(error));
    }
  },
  {
    // If this returns false, the thunk cancels execution completely.
    condition: (querySchema, { getState }) => {
      const state = getState();
      const key = getCacheKey(querySchema);
      return !state.users.cache[key];
    },
  },
);

export default getAllUsers;
