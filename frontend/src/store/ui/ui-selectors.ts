/**
 * @file src/store/ui/ui-selectors.ts
 */

import type { RootState } from "..";

export const selectSidebarState = (state: RootState) => state.ui.sidebarState;
