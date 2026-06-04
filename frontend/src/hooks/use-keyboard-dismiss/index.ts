/**
 * @file src/hooks/use-keyboard-dismiss/index.ts
 */

import { useEffect } from "react";

function useKeyboardDismiss(
  active: boolean,
  onDismiss: () => void,
  key: KeyboardEvent["key"] = "Escape",
): void {
  useEffect(() => {
    if (!active) return; // skip listener entirely when inactive
    const handler = (e: KeyboardEvent) => {
      if (e.key === key) onDismiss();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [active, onDismiss, key]);
}

export default useKeyboardDismiss;
