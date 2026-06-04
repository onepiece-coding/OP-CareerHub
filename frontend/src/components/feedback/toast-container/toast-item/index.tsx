/**
 * @file src/components/feedback/toast-container/toast-item/index.tsx
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { removeToast } from "@/store/toasts/toasts-slice";
import { Alert, CloseButton } from "@/components/ui";
import type { Toast as IToast } from "@/lib/types";
import { useAppDispatch } from "@/store/hooks";

import styles from "./styles.module.css";

const Toast = ({ id, type, title, message }: IToast) => {
  const dispatch = useAppDispatch();

  // The progress bar width is 400 pixels, representing 100% completion.
  const totalWidth = 100;

  // Total duration in milliseconds
  const duration = 4000;

  // Interval time in milliseconds
  const intervalTime = duration / totalWidth;

  // 100% completion
  const maxProgress = 100;

  // State for CSS trigger (fadeOut keyframes)
  const [isExiting, setIsExiting] = useState(false);

  const [progressBarIndicator, setProgressBarIndicator] = useState(0);
  const isPausedRef = useRef(false); // ✅ Ref — no re-render on change

  // remove toast handler
  const closeToastHandler = useCallback(() => {
    setIsExiting(true); // Start CSS animation
    setTimeout(() => {
      dispatch(removeToast(id)); // Remove from Redux after animation
    }, 400); // Matches CSS animation duration
  }, [id, dispatch]);

  // Mouse handlers update the ref directly — no state, no re-render, no effect restart
  const handleMouseEnter = () => {
    isPausedRef.current = true;
  };
  const handleMouseLeave = () => {
    isPausedRef.current = false;
  };

  // One stable interval for the toast's lifetime
  useEffect(() => {
    if (isExiting) return;

    const timerId = setInterval(() => {
      if (isPausedRef.current) return; // ✅ Always reads latest value via ref

      setProgressBarIndicator((prev) => {
        if (prev >= maxProgress) {
          clearInterval(timerId);
          closeToastHandler();
          return prev;
        }
        return prev + 1;
      });
    }, intervalTime);

    return () => clearInterval(timerId);
  }, [intervalTime, isExiting, closeToastHandler]); // ✅ Stable deps — no hover restart

  return (
    <Alert
      className={`${styles.toast} ${isExiting ? styles.toastExiting : ""}`}
      customStyles={{ marginBottom: 0 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      variant={type}
    >
      <h5>{title || type}</h5>
      <p>{message}</p>
      <CloseButton variant={type} onClick={closeToastHandler} />
      <span
        className={`${styles.placeholder} ${styles[`placeholder-${type}`]}`}
        style={{
          width: `${progressBarIndicator}%`,
          transition: `width ${intervalTime}ms linear`,
        }}
      ></span>
    </Alert>
  );
};

export default Toast;
