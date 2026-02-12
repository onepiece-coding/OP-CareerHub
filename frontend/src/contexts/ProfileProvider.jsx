import { useCallback, useEffect, useState } from "react";
import { axiosErrorHandler } from "../api/axiosErrorHandler";
import { ProfileContext } from ".";
import { axiosInstance } from "../api/axiosInstance";
import { toast } from "react-toastify";

const ProfileProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userStatus, setUserStatus] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(null);
  const [image, setImage] = useState(null);

  const fetchProfile = async () => {
    setLoading(true);

    try {
      const { data } = await axiosInstance.get(`/api/v1/auth/me`);
      setUser(data?.result);
      setUserStatus({ status: true, message: "" });
    } catch (error) {
      setUserStatus({ status: false, message: axiosErrorHandler(error) });
    } finally {
      setLoading(false);
    }
  };

  const handleLogOut = async () => {
    try {
      await axiosInstance.post(`/api/v1/auth/logout`);
      toast.success("Vous vous êtes déconnecté avec succès");
      fetchProfile();
    } catch (error) {
      toast.error(axiosErrorHandler(error));
    }
  };

  const chooseFile = useCallback((e) => {
    if (e.target.files?.[0]) {
      // Validate file type
      if (!e.target.files[0].type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      // Validate file size (max 5MB)
      if (e.target.files[0].size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }
      setImage(e.target.files[0]);
    }
  }, []);

  const profilePhotoUpload = useCallback(async () => {
    const formData = new FormData();

    formData.set("image", image);

    setUploading(true);

    try {
      await axiosInstance.post(
        "/api/v1/users/profile/profile-photo-upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success("Photo de profil téléchargée avec succès");
      fetchProfile();
    } catch (error) {
      toast.error(axiosErrorHandler(error));
    } finally {
      setUploading(false);
      setImage(null);
    }
  }, [image]);

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <ProfileContext.Provider
      value={{
        loading,
        userStatus,
        user,
        uploading,
        image,
        fetchProfile,
        handleLogOut,
        chooseFile,
        profilePhotoUpload,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export default ProfileProvider;
