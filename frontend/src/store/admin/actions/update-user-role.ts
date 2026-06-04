/**
 * @file src/store/admin/actions/update-user-role.ts
 */

import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosErrorHandler } from "@/lib/utils";
import type { Role, User } from "@/lib/types";

import api from "@/services/api-service";

type UpdateUserRolePayload = {
  id: string;
  role: Role;
};

const updateUserRole = createAsyncThunk(
  "admin/updateUserRole",
  async (updateUserRolePayload: UpdateUserRolePayload, thunk) => {
    const { fulfillWithValue, rejectWithValue } = thunk;

    try {
      await api.patch<User>(`/admin/update-role`, updateUserRolePayload);
      return fulfillWithValue({ role: updateUserRolePayload.role });
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Update User Role:", error);
      }
      return rejectWithValue(axiosErrorHandler(error));
    }
  },
);

export default updateUserRole;
