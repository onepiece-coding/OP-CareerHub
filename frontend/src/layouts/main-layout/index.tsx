/**
 * @file src/layouts/main-layout/index.tsx
 */

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getMe, logoutUser } from "@/store/auth/auth-slice";
import { ToastContainer } from "@/components/feedback";
import { Outlet, useNavigate } from "react-router-dom";
import { UserService } from "@/services/auth-service";
import { Footer, Navbar } from "@/components/common";
import {
  selectIsAuthenticated,
  selectLogoutStatus,
  selectCurrentUser,
} from "@/store/auth/auth-selectors";
import { useEffect, useState } from "react";
import {
  AUTHENTICATED_NAV_ITEMS,
  UNAUTHENTICATED_NAV_ITEMS,
} from "./navbar.data";

import styles from "./styles.module.css";

function MainLayout() {
  const [open, setOpen] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const currentUser = useAppSelector(selectCurrentUser);
  const status = useAppSelector(selectLogoutStatus);

  const handleLogout = async () => {
    await dispatch(logoutUser()).unwrap();
    setOpen(false);
    navigate("/auth/login", { replace: true });
  };

  useEffect(() => {
    // getMe.rejected handles state cleanup (clears user + localStorage).
    // We don't need to act on failure here — the slice does it for us.
    // Don't unwrap — let the slice case manage the outcome.
    // Only verify if we actually have a user record locally.
    if (UserService.getUser()) {
      dispatch(getMe()); // ✅ Fire-and-let-slice-handle
    }
  }, [dispatch]);

  return (
    <div className={styles.appShell}>
      <ToastContainer position="bottom-right" />
      <Navbar
        NAV_ITEMS={
          isAuthenticated ? AUTHENTICATED_NAV_ITEMS : UNAUTHENTICATED_NAV_ITEMS
        }
        isAuthenticated={isAuthenticated}
        username={currentUser?.username}
        handleLogout={handleLogout}
        setOpen={setOpen}
        status={status}
        open={open}
      />
      <main className={styles.main}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;
