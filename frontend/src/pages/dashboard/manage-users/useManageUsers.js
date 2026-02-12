import { useCallback, useEffect, useState } from "react";
import { axiosErrorHandler } from "../../../api/axiosErrorHandler";
import { axiosInstance } from "../../../api/axiosInstance";
import { toast } from "react-toastify";

const useManageUsers = () => {
  const [state, setState] = useState({
    data: [],
    loading: false,
    error: null,
  });

  const [deleteLoading, setDeleteLoading] = useState(false);

  const getAllUsers = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const { data } = await axiosInstance.get("/api/v1/users");
      setState((prev) => ({
        ...prev,
        data: data.users,
        loading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: axiosErrorHandler(error),
        loading: false,
      }));
    }
  }, []);

  const updateUserRole = useCallback(
    async (userId, role) => {
      try {
        const { data } = await axiosInstance.patch(
          `/api/v1/admin/update-role`,
          {
            id: userId,
            role,
          }
        );
        toast.success(data.message);
        getAllUsers();
      } catch (error) {
        toast.error(axiosErrorHandler(error));
      }
    },
    [getAllUsers]
  );

  const deleteUser = useCallback(
    async (userId) => {
      if (confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur?")) {
        try {
          const { data } = await axiosInstance.delete(
            `/api/v1/users/${userId}`
          );
          toast.success(data.message);
          getAllUsers();
        } catch (error) {
          toast.error(axiosErrorHandler(error));
        }
      }
    },
    [getAllUsers]
  );

  const deleteAllUsers = useCallback(async () => {
    if (confirm("Êtes-vous sûr de vouloir supprimer tous les utilisateurs ?")) {
      setDeleteLoading(true);
      try {
        const { data } = await axiosInstance.delete(`/api/v1/users`);
        toast.success(data.message);
        getAllUsers();
      } catch (error) {
        toast.error(axiosErrorHandler(error));
      } finally {
        setDeleteLoading(false);
      }
    }
  }, [getAllUsers]);

  useEffect(() => {
    getAllUsers();
  }, [getAllUsers]);

  return { state, deleteLoading, updateUserRole, deleteUser, deleteAllUsers };
};

export default useManageUsers;