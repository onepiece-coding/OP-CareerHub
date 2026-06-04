/**
 * @file src/store/ui/ui-slcie.ts
 */

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  sidebarState: boolean;
}

const initialState: UIState = {
  sidebarState: false,
};

const UISlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebarState: (state, action: PayloadAction<boolean>) => {
      state.sidebarState = action.payload;
    },
  },
});

export const { toggleSidebarState } = UISlice.actions;

export default UISlice.reducer;
