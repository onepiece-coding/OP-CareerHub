/**
 * @file src/pages/dashboard/notifications/delete-notification.component.tsx
 */

import { deleteNotification } from "@/store/notifications/notifications-slice";
import { addToast } from "@/store/toasts/toasts-slice";
import { Badge, ConfirmDialog } from "@/components/ui";
import { TrashIcon } from "@/components/icons";
import { useAppDispatch } from "@/store/hooks";
import { useState } from "react";

interface DeleteNotificationProps {
  notificationId: string;
}

const DeleteNotification = ({ notificationId }: DeleteNotificationProps) => {
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const dispatch = useAppDispatch();

  const handleDeleteNotification = async (notificationId: string) => {
    if (!notificationId) return;

    setLoading(true);

    try {
      await dispatch(deleteNotification(notificationId)).unwrap();

      dispatch(
        addToast({
          type: "success",
          message: "Notification deleted successfully",
        }),
      );
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Delete Notification:", error);
      }
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <Badge as="button" variant="red" onClick={() => setIsOpen(true)}>
        <TrashIcon />
      </Badge>

      <ConfirmDialog
        message="Are you sure you want to delete this notification?"
        onConfirm={() => handleDeleteNotification(notificationId)}
        title={`Delete Notification`}
        onCancel={() => setIsOpen(false)}
        isLoading={loading}
        isOpen={isOpen}
      />
    </>
  );
};

export default DeleteNotification;
