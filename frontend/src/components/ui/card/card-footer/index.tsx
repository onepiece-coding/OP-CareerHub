/**
 * @file src/components/ui/card/card-footer/index.tsx
 */

import type { ReactNode } from "react";
import { cx } from "@/lib/utils";

import styles from "./styles.module.css";

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

const CardFooter = ({ children, className = "" }: CardFooterProps) => {
  return <div className={cx(styles["card-footer"], className)}>{children}</div>;
};

export default CardFooter;
