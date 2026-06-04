/**
 * @file src/components/ui/confirm-dialog/index.tsx
 */

import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

import styles from "./styles.module.css";
import Button from "../button";

interface ConfirmDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
  isLoading?: boolean;
  message?: string;
  isOpen: boolean;
  title?: string;
}

const ConfirmDialog = ({
  title = "Are you sure?",
  isLoading = false,
  onConfirm,
  onCancel,
  children,
  message,
  isOpen,
}: ConfirmDialogProps) => {
  const confirmBtnRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  // ✅ Focus the confirm button when dialog opens
  useEffect(() => {
    if (isOpen) confirmBtnRef.current?.focus();
  }, [isOpen]);

  // ✅ ESC key dismissal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) onCancel();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  const modal = (
    <div className={styles.overlay} onClick={!isLoading ? onCancel : undefined}>
      <div
        onClick={(e) => e.stopPropagation()}
        className={styles.modal}
        aria-labelledby={titleId} /* ✅ Links to h2 */
        aria-modal="true" /* ✅ Prevents AT from reading behind */
        role="dialog" /* ✅ Screen readers announce "dialog" */
      >
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>

        <div className={styles.body}>
          {children ??
            (message ? <p className={styles.message}>{message}</p> : null)}
        </div>

        <div className={styles.footer}>
          <Button onClick={onCancel} variant="slate" disabled={isLoading}>
            Cancel
          </Button>
          <Button
            ref={confirmBtnRef} /* ✅ Receives focus on open */
            disabled={isLoading}
            onClick={onConfirm}
            variant="red"
          >
            {isLoading ? "Processing..." : "Confirm"}
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body); // ✅ Portal for correct stacking
};

export default ConfirmDialog;
