/**
 * @file src/components/ui/spinner/index.tsx
 */

import { cx } from "@/lib/utils";

import styles from "./styles.module.css";

interface SpinnerProps {
  className?: string;
}

const Spinner = ({ className = "" }: SpinnerProps) => {
  return (
    <div className={cx(styles.spinner, className)} role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  );
};

export default Spinner;
