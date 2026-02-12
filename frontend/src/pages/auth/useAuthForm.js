import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../../api/axiosInstance";
import { axiosErrorHandler } from "../../api/axiosErrorHandler";
import { loginSchema } from "../../validations/loginSchema";
import { registerSchema } from "../../validations/registerSchema";
import { useProfileContext } from "../../hooks/useProfileContext";

// Define allowed auth types for clarity and future scalability.
const AUTH_TYPES = {
  register: "register",
  login: "login",
};

// Options object to hold configuration for each auth flow.
const options = {
  [AUTH_TYPES.register]: {
    schema: registerSchema,
    to: "/login",
    message: "Vous vous êtes inscrit avec succès",
  },
  [AUTH_TYPES.login]: {
    schema: loginSchema,
    to: "/",
    message: "Vous vous êtes connecté avec succès",
  },
};

const useAuthForm = (authType) => {
  // Validate that the authType provided is valid.
  if (!options[authType]) {
    throw new Error(`Invalid authType: ${authType}`);
  }

  const { fetchProfile } = useProfileContext();

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    resolver: zodResolver(options[authType].schema),
  });

  const handlePasswordVisibility = () => {
    setPasswordVisibility((prev) => !prev);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post(
        `/api/v1/auth/${authType}`,
        data
      );

      if (response.data.unreadNotificationsCount) {
        toast.info(
          `Vous avez ${response.data.unreadNotificationsCount} nouvelles notifications`
        );
      } else {
        toast.success(options[authType].message);
      }

      if (authType === "login") {
        fetchProfile();
      }

      reset();

      navigate(options[authType].to, { replace: true });
    } catch (error) {
      const errorMessage = axiosErrorHandler(error);
      console.log(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    register,
    handleSubmit,
    onSubmit,
    handlePasswordVisibility,
    errors,
    loading,
    passwordVisibility,
  };
};

export default useAuthForm;
