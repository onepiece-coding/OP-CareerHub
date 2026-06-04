/**
 * @file src/hooks/use-scroll-lock/index.ts
 */

import { useEffect } from "react";

function useScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [active]);
}

export default useScrollLock;
