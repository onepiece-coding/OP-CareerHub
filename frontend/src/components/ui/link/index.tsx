/**
 * @file src/components/ui/link/index.tsx
 */

import { Link as ReactRouterLink } from "react-router-dom";

import styles from "./styles.module.css";

type LinkVariant = "primary" | "secondary";

interface LinkProps extends Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "href"
> {
  children: React.ReactNode;
  variant?: LinkVariant;
  external?: boolean;
  to: string;
}

const Link = ({
  variant = "primary",
  external = false,
  children,
  to,
  ...rest
}: LinkProps) => {
  const className =
    variant === "primary" ? styles["link-primary"] : styles["link-secondary"];

  if (external) {
    return (
      <a
        className={`${styles["link"]} ${className}`}
        rel="noopener noreferrer"
        target="_blank"
        href={to}
        {...rest}
      >
        {children}
      </a>
    );
  }

  return (
    <ReactRouterLink
      className={`${styles["link"]} ${className}`}
      {...rest}
      to={to}
    >
      {children}
    </ReactRouterLink>
  );
};

export default Link;
