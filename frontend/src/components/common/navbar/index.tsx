/**
 * @file src/components/common/navbar/index.tsx
 */

import { useFocusOnOpen, useKeyboardDismiss, useScrollLock } from "@/hooks";
import { toggleSidebarState } from "@/store/ui/ui-slice";
import { Link, NavLink, useLocation } from "react-router-dom";
import type { NavItem, Status } from "@/lib/types";
import { useAppDispatch } from "@/store/hooks";
import { useRef, type Dispatch, type SetStateAction } from "react";
import { Badge } from "@/components/ui";

import styles from "./styles.module.css";
// import MobileMenu from "./mobile-menu";
import Sidebar from "../sidebar";
import Brand from "../brand";

interface NavbarProps {
  setOpen: Dispatch<SetStateAction<boolean>>;
  isAuthenticated: boolean;
  handleLogout: () => void;
  NAV_ITEMS: NavItem[];
  username?: string;
  status: Status;
  open: boolean;
}

const Navbar = ({
  isAuthenticated,
  handleLogout,
  NAV_ITEMS,
  username,
  setOpen,
  status,
  open,
}: NavbarProps) => {
  // const [open, setOpen] = useState(false);

  const firstLinkRef = useRef<HTMLAnchorElement | null>(null);
  const location = useLocation();

  const mobileMenuId = "primary-mobile-menu";

  useKeyboardDismiss(open, () => setOpen(false));
  useFocusOnOpen(open, firstLinkRef);
  useScrollLock(open);

  const dispatch = useAppDispatch();

  const handleDashboardSidebarOpen = () => {
    dispatch(toggleSidebarState(true));
  };

  return (
    <nav className={styles.navbar}>
      <div className={`container ${styles.navbarContainer}`}>
        {isAuthenticated && location.pathname.includes("dashboard") ? (
          // <button
          //   aria-label={`Open dashboard navigation for ${username}`}
          //   aria-controls="primary-dashboard-menu"
          //   onClick={handleDashboardSidebarOpen}
          //   className={styles.sidebarTrigger}
          //   aria-expanded={open}
          // >
          // </button>
          <Badge
            aria-label={`Open dashboard navigation for ${username}`}
            aria-controls="primary-dashboard-menu"
            onClick={handleDashboardSidebarOpen}
            aria-expanded={open}
            variant="slate"
            as="button"
          >{`Welcome, ${username}`}</Badge>
        ) : (
          <Brand />
        )}

        {/* desktop nav links */}
        <div
          aria-label={"Main navigation"}
          className={styles.navLinks}
          role="navigation"
        >
          {NAV_ITEMS.map((item) => {
            if (item.type === "link") {
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `${styles.link} ${isActive ? styles.linkActive : ""}`
                  }
                >
                  {item.label}
                </NavLink>
              );
            }
            if (item.type === "action") {
              if (item.action === "logout") {
                return (
                  <button // ✅ Semantic interactive element
                    aria-busy={status === "pending"}
                    disabled={status === "pending"}
                    className={styles.link}
                    onClick={handleLogout}
                    key="logout"
                  >
                    {status === "pending" ? "Logging out…" : item.label}
                  </button>
                );
              }
            }
          })}
        </div>

        {/* hamburger for mobile */}
        <button
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setOpen((v) => !v)}
          className={styles.hamburger}
          aria-controls={mobileMenuId}
          aria-expanded={open}
        >
          <span className={styles.hamburgerIcon} aria-hidden="true" />
        </button>

        {/* slide-in mobile menu */}
        <Sidebar
          sidebarLabel="Main site navigation"
          onClose={() => setOpen(false)}
          firstLinkRef={firstLinkRef}
          handleLogout={handleLogout}
          SIDEBAR_ITEMS={NAV_ITEMS}
          menuId={mobileMenuId}
          status={status}
          open={open}
          sidebarFooter={
            <div className={styles.sidebarFooter}>
              <p>
                {"Join Our Company Today!"}{" "}
                <Link to="/jobs">Voir les Offres</Link>
              </p>
            </div>
          }
        />
      </div>
    </nav>
  );
};

export default Navbar;
