/**
 * @file src/components/feedback/toast-container/index.tsx
 */

import { selectToasts } from "@/store/toasts/toasts-selectors";
import { useAppSelector } from "@/store/hooks";

import styles from "./styles.module.css";
import Toast from "./toast-item";

interface ToastContainerProps {
  position:
    | "top-right"
    | "right-center"
    | "bottom-right"
    | "bottom-center"
    | "bottom-left"
    | "left-center"
    | "top-left"
    | "top-center";
}

const ToastContainer = ({ position }: ToastContainerProps) => {
  const toasts = useAppSelector(selectToasts);

  return (
    <div
      className={`${styles.toastContainer} ${styles[`position-${position}`]}`}
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          title={toast.title}
          type={toast.type}
          message={toast.message}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
