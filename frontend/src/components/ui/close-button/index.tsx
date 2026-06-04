/**
 * @file src/components/ui/close-button/index.tsx
 */

import { XMarkIcon } from "@/components/icons";

import styles from "./styles.module.css";

interface CloseButtonProps {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  variant:
    | "primary"
    | "secondary"
    | "success"
    | "danger"
    | "warning"
    | "info"
    | "light"
    | "dark";
}

const CloseButton = ({ onClick, variant }: CloseButtonProps) => {
  return (
    <button
      className={`${styles["btn-close"]} ${styles[`btn-close-${variant}`]}`}
      aria-label="Close"
      onClick={onClick}
      type="button"
    >
      <XMarkIcon />
    </button>
  );
};

export default CloseButton;
