/**
 * @file src/components/ui/card/card-root/index.tsx
 */

import type { CSSProperties, ReactNode } from "react";
import { cx } from "@/lib/utils";

import styles from "./styles.module.css";

interface CardRootProps {
  style?: CSSProperties;
  children: ReactNode;
  className?: string;
}

const CardRoot = ({ children, className = "", style }: CardRootProps) => {
  return (
    <div className={cx(styles.card, className)} style={style}>
      {children}
    </div>
  );
};

export default CardRoot;
