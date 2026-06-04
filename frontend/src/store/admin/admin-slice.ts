/**
 * @file src/store/admin/admin-slice.ts
 */

import { type AllInfo, type OperationState } from "@/lib/types";
import { handlePending, handleRejected } from "@/lib/utils";
import { createSlice } from "@reduxjs/toolkit";

import updateUserRole from "./actions/update-user-role";
import getAllInfo from "./actions/get-all-Info";

interface AdminState {
  updateUserRole: OperationState;
  getAllInfo: OperationState;

  info: AllInfo | null;
}

const initialState: AdminState = {
  updateUserRole: { status: "idle", error: null },
  getAllInfo: { status: "idle", error: null },

  info: null,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearGetAllInfoState: (state) => {
      state.getAllInfo = { status: "idle", error: null };
    },
    clearUpdateUserRoleState: (state) => {
      state.updateUserRole = { status: "idle", error: null };
    },
  },
  extraReducers: (builder) => {
    // Get All Info
    builder.addCase(getAllInfo.pending, (state) => {
      handlePending(state, "getAllInfo");
    });
    builder.addCase(getAllInfo.fulfilled, (state, action) => {
      state.getAllInfo.status = "succeeded";
      state.info = action.payload;
    });
    builder.addCase(getAllInfo.rejected, (state, action) => {
      handleRejected(state, "getAllInfo", action);
    });

    // Update User Role
    builder.addCase(updateUserRole.pending, (state) => {
      handlePending(state, "updateUserRole");
    });
    builder.addCase(updateUserRole.fulfilled, (state) => {
      state.updateUserRole.status = "succeeded";
    });
    builder.addCase(updateUserRole.rejected, (state, action) => {
      handleRejected(state, "updateUserRole", action);
    });
  },
});

export const { clearGetAllInfoState, clearUpdateUserRoleState } =
  adminSlice.actions;

export { getAllInfo, updateUserRole };

export default adminSlice.reducer;
