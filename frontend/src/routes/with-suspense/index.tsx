/**
 * @file src/routes/with-suspense/index.tsx
 */

import { lazy, Suspense } from "react";

import styles from "./styles.module.css";

type NoPropsComponent = React.ComponentType<Record<string, never>>;

export function lazyWithSuspense(
  factory: () => Promise<{ default: NoPropsComponent }>,
) {
  const Component = lazy(factory);
  return function LazyComponent() {
    return (
      <Suspense
        fallback={<div className={styles.suspenseFallback}>Loading…</div>}
      >
        <Component />
      </Suspense>
    );
  };
}
