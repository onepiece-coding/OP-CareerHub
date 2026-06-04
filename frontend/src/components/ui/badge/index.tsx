/**
 * @file src/components/ui/badge/index.tsx
 */

import styles from "./styles.module.css";

type BadgeVariant = "blue" | "slate" | "red" | "emerald" | "yellow";

interface BadgeBaseProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
}

type BadgeAsSpan = BadgeBaseProps & {
  as?: "span";
} & React.HTMLAttributes<HTMLSpanElement>;

type BadgeAsButton = BadgeBaseProps & {
  as: "button";
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

type BadgeProps = BadgeAsSpan | BadgeAsButton;

const Badge = ({
  variant = "blue",
  as: Tag = "span",
  children,
  ...rest
}: BadgeProps) => {
  const className =
    variant === "blue"
      ? styles["badge-blue"]
      : variant === "slate"
        ? styles["badge-slate"]
        : variant === "red"
          ? styles["badge-red"]
          : variant === "emerald"
            ? styles["badge-emerald"]
            : variant === "yellow"
              ? styles["badge-yellow"]
              : null;

  return (
    <Tag
      className={`${styles["badge"]} ${className}`}
      {...(rest as React.HTMLAttributes<HTMLElement>)}
    >
      {children}
    </Tag>
  );
};

export default Badge;
