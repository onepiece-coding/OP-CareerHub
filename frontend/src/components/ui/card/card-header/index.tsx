/**
 * @file src/components/ui/card/card-header/index.tsx
 */

import type { ReactNode } from "react";
import { cx } from "@/lib/utils";

import styles from "./styles.module.css";

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

const CardHeader = ({ children, className = "" }: CardHeaderProps) => {
  return <div className={cx(styles["card-header"], className)}>{children}</div>;
};

export default CardHeader;
