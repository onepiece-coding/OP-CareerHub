/**
 * @file src/components/ui/button/index.tsx
 */

import type { RefObject } from "react";
import styles from "./styles.module.css";

type ButtonVariant = "blue" | "slate" | "red" | "emerald" | "yellow";

interface ButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "type"
> {
  ref?: RefObject<HTMLButtonElement | null>;
  type?: "button" | "reset" | "submit";
  children: React.ReactNode;
  variant?: ButtonVariant;
  ariaBusy?: boolean;
}

const Button = ({
  variant = "blue",
  ariaBusy = false,
  type = "button",
  children,
  ref,
  ...rest
}: ButtonProps) => {
  const className =
    variant === "blue"
      ? styles["btn-blue"]
      : variant === "slate"
        ? styles["btn-slate"]
        : variant === "red"
          ? styles["btn-red"]
          : variant === "emerald"
            ? styles["btn-emerald"]
            : variant === "yellow"
              ? styles["btn-yellow"]
              : null;

  return (
    <button
      className={`${styles["btn"]} ${className}`}
      aria-busy={ariaBusy}
      type={type}
      {...rest}
      ref={ref}
    >
      {children}
    </button>
  );
};

export default Button;
