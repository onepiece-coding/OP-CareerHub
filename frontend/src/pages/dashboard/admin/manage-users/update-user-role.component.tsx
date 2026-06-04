/**
 * @file src/pages/dashboard/admin/manage-users/update-user-role.component.tsx
 */

import { updateUserRole } from "@/store/admin/admin-slice";
import { addToast } from "@/store/toasts/toasts-slice";
import { useAppDispatch } from "@/store/hooks";
import { Button } from "@/components/ui";
import type { Role } from "@/lib/types";
import { useState } from "react";

interface UpdateUseRoleProps {
  userId: string;
  role: Role;
}

const UpdateUserRole = ({ userId, role }: UpdateUseRoleProps) => {
  const [loading, setLoading] = useState(false);

  const dispatch = useAppDispatch();

  const handleUpdateUserRole = async (userId: string, role: Role) => {
    if (!userId || !role) return;

    setLoading(true);

    try {
      await dispatch(updateUserRole({ id: userId, role })).unwrap();

      dispatch(
        addToast({
          type: "success",
          message: "Role updated successfully",
        }),
      );
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Update User Role:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={
        role === "admin" ? "yellow" : role === "recruiter" ? "blue" : "emerald"
      }
      onClick={() => handleUpdateUserRole(userId, role)}
      aria-label={`Set role to ${role} for this user`}
      aria-busy={loading}
    >
      {loading ? "Updating..." : role.charAt(0).toUpperCase() + role.slice(1)}
    </Button>
  );
};

export default UpdateUserRole;
