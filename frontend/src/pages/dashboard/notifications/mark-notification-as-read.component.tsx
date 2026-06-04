/**
 * @file src/pages/dashboard/notifications/mark-notification-as-read.component.tsx
 */

import { markNotificationAsRead } from "@/store/notifications/notifications-slice";
import { addToast } from "@/store/toasts/toasts-slice";
import { CheckCircleIcon } from "@/components/icons";
import { Badge, Spinner } from "@/components/ui";
import { useAppDispatch } from "@/store/hooks";
import { useState } from "react";

import styles from "./styles.module.css";

interface MarkNotificationAsReadProps {
  notificationId: string;
}

const MarkNotificationAsRead = ({
  notificationId,
}: MarkNotificationAsReadProps) => {
  const [loading, setLoading] = useState(false);

  const dispatch = useAppDispatch();

  const handleMarkNotificationAsRead = async () => {
    if (!notificationId) return;

    setLoading(true);

    try {
      await dispatch(markNotificationAsRead(notificationId)).unwrap();

      dispatch(
        addToast({
          type: "success",
          message: "Notification marked as read",
        }),
      );
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Mark Notification As Read:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Badge
      aria-label={`Mark Notification As Read`}
      onClick={handleMarkNotificationAsRead}
      aria-busy={loading}
      disabled={loading}
      variant="emerald"
    >
      {loading ? <Spinner className={styles.spinner} /> : <CheckCircleIcon />}
    </Badge>
  );
};

export default MarkNotificationAsRead;
