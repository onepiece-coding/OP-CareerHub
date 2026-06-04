/**
 * @file src/components/icons/eye-off-icon/index.tsx
 */

import styles from "./styles.module.css";

const EyeOffIcon = () => {
  return (
    <svg
      className={styles["eye-off-icon"]}
      strokeLinejoin="round"
      stroke="currentColor"
      strokeLinecap="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
      strokeWidth={2}
      fill="none"
      height={17}
      width={17}
    >
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
};

export default EyeOffIcon;
