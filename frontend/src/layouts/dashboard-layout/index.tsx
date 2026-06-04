/**
 * @file src/layouts/dashboard-layout/index.tsx
 */

import { selectIsAdmin, selectIsRecruiter } from "@/store/auth/auth-selectors";
import { useFocusOnOpen, useKeyboardDismiss, useScrollLock } from "@/hooks";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectSidebarState } from "@/store/ui/ui-selectors";
import { toggleSidebarState } from "@/store/ui/ui-slice";
import Sidebar from "@/components/common/sidebar";
import { Outlet } from "react-router-dom";
import { useRef } from "react";
import {
  ADMIN_NAV_ITEMS,
  RECRUITER_NAV_ITEMS,
  USER_NAV_ITEMS,
} from "./dashboard.data";

const DashboardLayout = () => {
  const firstLinkRef = useRef<HTMLAnchorElement | null>(null);
  const mobileMenuId = "primary-dashboard-menu";

  const open = useAppSelector(selectSidebarState);

  const isRecruiter = useAppSelector(selectIsRecruiter);
  const isAdmin = useAppSelector(selectIsAdmin);

  const dispatch = useAppDispatch();

  const onClose = () => {
    dispatch(toggleSidebarState(false));
  };

  useKeyboardDismiss(open, onClose);
  useFocusOnOpen(open, firstLinkRef);
  useScrollLock(open);

  return (
    <div className={"root"}>
      <Sidebar
        sidebarLabel="Dashboard navigation"
        firstLinkRef={firstLinkRef}
        SIDEBAR_ITEMS={
          isAdmin
            ? ADMIN_NAV_ITEMS
            : isRecruiter
              ? RECRUITER_NAV_ITEMS
              : USER_NAV_ITEMS
        }
        menuId={mobileMenuId}
        onClose={onClose}
        position="left"
        open={open}
      />
      <Outlet />
    </div>
  );
};

export default DashboardLayout;
