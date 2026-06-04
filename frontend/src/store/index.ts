/**
 * @file src/store/index.ts
 */

import {
  combineReducers,
  configureStore,
  type UnknownAction,
} from "@reduxjs/toolkit";

import NotificationsReducer from "./notifications/notifications-slice";
import ApplicationsReducer from "./applications/applications-slice";
import PasswordReducer from "./password/password-slice";
import ToastsReducer from "./toasts/toasts-slice";
import UsersReducer from "./users/users-slice";
import AdminReducer from "./admin/admin-slice";
import AuthReducer from "./auth/auth-slice";
import JobsReducer from "./jobs/jobs-slice";
import UIReducer from "./ui/ui-slice";

type AppState = ReturnType<typeof appReducer>;

// 1. Combine your reducers like normal
const appReducer = combineReducers({
  notifications: NotificationsReducer,
  applications: ApplicationsReducer,
  password: PasswordReducer,
  toasts: ToastsReducer,
  users: UsersReducer,
  admin: AdminReducer,
  auth: AuthReducer,
  jobs: JobsReducer,
  ui: UIReducer,
});

const rootReducer = (state: AppState | undefined, action: UnknownAction) => {
  // Check if the action is your logout action.
  // (Change 'auth/logout' to whatever your actual logout action type is)
  if (action.type === "auth/logoutUser/fulfilled") {
    // Setting state to undefined forces EVERY slice to revert to its initialState!
    // This instantly wipes all caches, errors, and stale data app-wide.
    state = undefined;
  }

  return appReducer(state, action);
};

// 3. Configure the store with the Root Reducer
export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
