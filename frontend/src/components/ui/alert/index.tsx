/**
 * @file src/components/ui/alert/index.tsx
 */

import styles from "./styles.module.css";

interface AlertProps {
  onMouseEnter?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (event: React.MouseEvent<HTMLDivElement>) => void;
  customStyles?: React.CSSProperties;
  children: React.ReactNode;
  className?: string;
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

const Alert = ({
  onMouseEnter,
  onMouseLeave,
  customStyles,
  className,
  children,
  variant,
}: AlertProps) => {
  const ariaRole =
    variant === "danger" || variant === "warning" ? "alert" : "status";
  return (
    <div
      className={`${styles.alert} ${styles[`alert-${variant}`]} ${className ?? ""}`.trim()}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={customStyles}
      role={ariaRole}
    >
      {children}
    </div>
  );
};

export default Alert;
