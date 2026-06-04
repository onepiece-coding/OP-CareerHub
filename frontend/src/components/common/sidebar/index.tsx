/**
 * @file src/components/common/sidebar/index.tsx
 */

import type { NavItem, Status } from "@/lib/types";
import { NavLink } from "react-router-dom";
import { createPortal } from "react-dom";

import styles from "./styles.module.css";
import Brand from "../brand";

interface SidebarProps {
  sidebarFooter?: React.ReactNode;
  firstLinkRef: React.RefObject<HTMLAnchorElement | null>;
  position?: "right" | "left";
  handleLogout?: () => void;
  SIDEBAR_ITEMS: NavItem[];
  sidebarLabel?: string;
  onClose: () => void;
  status?: Status;
  menuId: string;
  open: boolean;
}

const Sidebar = ({
  position = "right",
  SIDEBAR_ITEMS,
  firstLinkRef,
  handleLogout,
  sidebarLabel,
  onClose,
  status,
  menuId,
  open,
  sidebarFooter,
}: SidebarProps) => {
  const className =
    position === "right" ? styles["position-right"] : styles["position-left"];

  const menu = (
    <>
      {/* Backdrop overlay — closes menu on outside click */}
      {open && (
        <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />
      )}

      <div
        className={`${styles.sidebarMenu} ${className} ${open ? styles.open : ""}`}
        aria-label={sidebarLabel ?? "Site navigation"}
        aria-modal="true"
        role="dialog"
        id={menuId}
      >
        <div className={styles.sidebarHeader}>
          <Brand />
          <button
            aria-label={"Close navigation menu"}
            className={styles.sidebarClose}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <nav
          className={styles.sidebarNavLinks}
          aria-label={"Mobile site navigation"}
        >
          {SIDEBAR_ITEMS.map((item, idx) => {
            if (item.type === "link") {
              return (
                <NavLink
                  className={({ isActive }) =>
                    `${styles.sidebarLink} ${isActive ? styles.linkActive : ""}`
                  }
                  ref={idx === 0 ? firstLinkRef : undefined}
                  onClick={onClose}
                  key={item.to}
                  to={item.to}
                  end
                >
                  {item.label}
                </NavLink>
              );
            }
            if (item.type === "action") {
              if (item.action === "logout") {
                return (
                  <button // ✅ Semantic interactive element
                    key="logout"
                    onClick={handleLogout}
                    disabled={status === "pending"}
                    className={styles.sidebarLink}
                    aria-busy={status === "pending"}
                  >
                    {status === "pending" ? "Logging out…" : item.label}
                  </button>
                );
              }
            }
          })}
        </nav>

        {sidebarFooter}
      </div>
    </>
  );

  return createPortal(menu, document.body);
};

export default Sidebar;
