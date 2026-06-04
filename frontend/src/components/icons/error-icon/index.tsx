/**
 * @file src/components/icons/error-icon/index.tsx
 */

import styles from "./styles.module.css";

const ErrorIcon = () => {
  return (
    <svg
      className={styles["error-icon"]}
      strokeLinejoin="round"
      strokeLinecap="round"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
      strokeWidth={2.5}
      fill="none"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
};

export default ErrorIcon;
