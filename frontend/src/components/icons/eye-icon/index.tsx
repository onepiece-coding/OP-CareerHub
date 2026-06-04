/**
 * @file src/components/icons/eye-icon/index.tsx
 */

interface EyeIconProps {
  stroke?: string;
  width?: number;
}

const EyeIcon = ({ stroke, width }: EyeIconProps) => {
  return (
    <svg
      stroke={stroke ?? "currentColor"}
      strokeLinejoin="round"
      strokeLinecap="round"
      viewBox="0 0 24 24"
      width={width ?? 16}
      aria-hidden="true"
      strokeWidth={2}
      fill="none"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
};

export default EyeIcon;
