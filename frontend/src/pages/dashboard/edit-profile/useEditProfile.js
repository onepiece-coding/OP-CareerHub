import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { axiosInstance } from "../../../api/axiosInstance";
import { axiosErrorHandler } from "../../../api/axiosErrorHandler";
import { toast } from "react-toastify";
import { zodResolver } from "@hookform/resolvers/zod";
import { editProfileSchema } from "../../../validations/editProfileSchema";

const useEditProfile = (initialData, fetchProfile) => {
  const navigate = useNavigate();
  const { id: userId } = useParams();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: initialData,
    resolver: zodResolver(editProfileSchema),
  });

  const onSubmit = async (data) => {
    const { username, location, pdf, gender } = data;
    const formData = new FormData();

    formData.set("username", username);
    formData.set("location", location);
    formData.set("pdf", pdf?.[0]);
    formData.set("gender", gender);

    try {
      await axiosInstance.patch(`/api/v1/users/${userId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Profile updated successfully");
      fetchProfile();
      reset();
      navigate("/dashboard");
    } catch (error) {
      toast.error(axiosErrorHandler(error));
    }
  };

  return {
    register,
    handleSubmit,
    onSubmit,
    errors,
    isSubmitting,
  };
};

export default useEditProfile;
