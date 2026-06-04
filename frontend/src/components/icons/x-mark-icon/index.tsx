/**
 * @file src/components/icons/x-mark-icon/index.tsx
 */

import { cx } from "@/lib/utils";

interface XMarkIconProps {
  className?: string;
}

const XMarkIcon = ({ className }: XMarkIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`${cx(className)}`}
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
      strokeWidth="1.5"
      fill="none"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18 18 6M6 6l12 12"
      />
    </svg>
  );
};

export default XMarkIcon;
