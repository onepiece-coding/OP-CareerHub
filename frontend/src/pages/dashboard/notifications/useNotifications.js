import { useCallback, useEffect, useState } from "react";
import { axiosInstance } from "../../../api/axiosInstance";
import { axiosErrorHandler } from "../../../api/axiosErrorHandler";
import { toast } from "react-toastify";

const useNotifications = () => {
  const [state, setState] = useState({
    data: [],
    loading: false,
    error: null,
  });

  const getNotifications = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const { data } = await axiosInstance.get("/api/v1/notifications");

      console.log(data);

      setState((prev) => ({
        ...prev,
        data: data.data,
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

  const markNotificationAsRead = useCallback(
    async (id) => {
      try {
        await axiosInstance.patch(`/api/v1/notifications/${id}`);
        toast.success("Marqué comme lu avec succès");
        getNotifications();
      } catch (error) {
        toast.error(axiosErrorHandler(error));
      }
    },
    [getNotifications]
  );

  const deleteNotification = useCallback(
    async (id) => {
      if (confirm("Êtes-vous sûr de vouloir supprimer cette notification ?")) {
        try {
          await axiosInstance.delete(`/api/v1/notifications/${id}`);
          toast.success("Notification supprimée avec succès");
          getNotifications();
        } catch (error) {
          toast.error(axiosErrorHandler(error));
        }
      }
    },
    [getNotifications]
  );

  useEffect(() => {
    getNotifications();
  }, [getNotifications]);

  return { state, markNotificationAsRead, deleteNotification };
};

export default useNotifications;
