/**
 * @file src/components/ui/card/card-body/index.tsx
 */

import type { ReactNode } from "react";
import { cx } from "@/lib/utils";

import styles from "./styles.module.css";

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

const CardBody = ({ children, className = "" }: CardBodyProps) => {
  return <div className={cx(styles["card-body"], className)}>{children}</div>;
};

export default CardBody;
