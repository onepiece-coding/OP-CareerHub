/**
 * @file src/components/icons/magnifying-glass-icon/index.tsx
 */

import { cx } from "@/lib/utils";

interface MagnifyingGlassIconProps {
  className?: string;
}

const MagnifyingGlassIcon = ({ className }: MagnifyingGlassIconProps) => {
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
        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
      />
    </svg>
  );
};

export default MagnifyingGlassIcon;
