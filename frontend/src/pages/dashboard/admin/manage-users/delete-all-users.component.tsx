/**
 * @file src/pages/dashboard/admin/manage-users/delete-all-users.component.tsx
 */

import { selectDeleteAllUsersStatus } from "@/store/users/users-selectors";
import { Button, ConfirmDialog, Select } from "@/components/ui";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { deleteAllUsers } from "@/store/users/users-slice";
import { addToast } from "@/store/toasts/toasts-slice";
import { useState } from "react";

import styles from "./styles.module.css";

type TargetSegment = "" | "recruiter" | "user";

interface DeleteAllUsersProps {
  onDeleteSuccess?: () => void;
}

const DeleteAllUsers = ({ onDeleteSuccess }: DeleteAllUsersProps) => {
  const [deleteTarget, setDeleteTarget] = useState<TargetSegment>("");
  const [isOpen, setIsOpen] = useState(false);

  const status = useAppSelector(selectDeleteAllUsersStatus);

  const dispatch = useAppDispatch();

  const handleSelectChange = (value: string): void => {
    setDeleteTarget(value as TargetSegment);
  };

  const handleDeleteAllUsers = async () => {
    try {
      await dispatch(deleteAllUsers(deleteTarget)).unwrap();
      const deleted =
        deleteTarget === "recruiter"
          ? "recruiters"
          : deleteTarget === "user"
            ? "users"
            : "non-admin users";
      dispatch(
        addToast({
          type: "success",
          message: `All ${deleted} and their associated data have been successfully deleted.`,
        }),
      );
      onDeleteSuccess?.();
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Delete User:", error);
      }
    } finally {
      setIsOpen(false);
    }
  };

  return (
    <>
      <Button variant="red" onClick={() => setIsOpen(true)}>
        Delete All Users
      </Button>

      <ConfirmDialog
        title={`Delete all non-admin users`}
        onConfirm={handleDeleteAllUsers}
        onCancel={() => setIsOpen(false)}
        isLoading={status === "pending"}
        isOpen={isOpen}
      >
        <p className={styles.label}>
          Please select which user segment you intend to wipe out:
        </p>
        <Select
          onChange={handleSelectChange}
          value={deleteTarget}
          id={"deleteTarget"}
          options={[
            { label: "Delete All Users & Recruiter", value: "" },
            { label: "Delete Recruiters Only", value: "recruiter" },
            { label: "Delete Regular Users Only", value: "user" },
          ]}
        />
      </ConfirmDialog>
    </>
  );
};

export default DeleteAllUsers;
