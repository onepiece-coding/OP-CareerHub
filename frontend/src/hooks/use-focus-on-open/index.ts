/**
 * @file src/hooks/use-focus-on-open/index.ts
 */

import { useEffect } from "react";

function useFocusOnOpen(
  active: boolean,
  ref: React.RefObject<HTMLElement | null>,
): void {
  useEffect(() => {
    if (!active) return;
    // rAF is more reliable than setTimeout — waits for paint
    const id = requestAnimationFrame(() => ref.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [active, ref]);
}

export default useFocusOnOpen;
