/**
 * @file src/store/toasts/toasts-selectors.ts
 */

import type { RootState } from "..";

export const selectToastsState = (state: RootState) => state.toasts;

export const selectToasts = (state: RootState) => state.toasts.records;
