/**
 * @file src/components/icons/plus-icon/index.tsx
 */

import { cx } from "@/lib/utils";

interface PlusIconProps {
  className?: string;
}

const PlusIcon = ({ className }: PlusIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`${cx(className)}`}
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      fill="none"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4.5v15m7.5-7.5h-15"
      />
    </svg>
  );
};

export default PlusIcon;
