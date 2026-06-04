/**
 * @file src/components/icons/clock-icon/index.tsx
 */

import { cx } from "@/lib/utils";

interface ClockIconProps {
  className?: string;
}

const ClockIcon = ({ className }: ClockIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`${cx(className)}`}
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      fill="none"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  );
};

export default ClockIcon;
