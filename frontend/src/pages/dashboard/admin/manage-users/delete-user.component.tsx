/**
 * @file src/pages/dashboard/admin/manage-users/delete-user.component.tsx
 */

import { Button, ConfirmDialog } from "@/components/ui";
import { addToast } from "@/store/toasts/toasts-slice";
import { deleteUser } from "@/store/users/users-slice";
import { useAppDispatch } from "@/store/hooks";
import { useState } from "react";

interface DeleteUserProps {
  onDeleteSuccess?: () => void;
  username: string;
  userId: string;
}

const DeleteUser = ({ onDeleteSuccess, username, userId }: DeleteUserProps) => {
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const dispatch = useAppDispatch();

  const handleDeleteUser = async (userId: string) => {
    if (!userId) return;

    setLoading(true);

    try {
      await dispatch(deleteUser(userId)).unwrap();

      dispatch(
        addToast({
          type: "success",
          message: "User deleted successfully",
        }),
      );

      // 2. Call it when the delete succeeds
      onDeleteSuccess?.();
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Delete User:", error);
      }
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <Button variant="red" onClick={() => setIsOpen(true)}>
        Delete
      </Button>

      <ConfirmDialog
        message="Are you sure you want to delete this user?"
        onConfirm={() => handleDeleteUser(userId)}
        title={`Delete User | ${username}`}
        onCancel={() => setIsOpen(false)}
        isLoading={loading}
        isOpen={isOpen}
      />
    </>
  );
};

export default DeleteUser;
