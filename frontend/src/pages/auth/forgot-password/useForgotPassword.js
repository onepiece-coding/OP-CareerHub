import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { forgotPasswordSchema } from "../../../validations/forgotPasswordSchema";
import { useCallback } from "react";
import { toast } from "react-toastify";
import { axiosErrorHandler } from "../../../api/axiosErrorHandler";
import { axiosInstance } from "../../../api/axiosInstance";

const useForgotPassword = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onBlur",
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = useCallback(
    async (data) => {
      const { email } = data;

      try {
        const { data } = await axiosInstance.post(
          "/api/v1/password/forgot-password",
          {
            email,
          }
        );
        toast.success(data.message);
        reset();
      } catch (error) {
        toast.error(axiosErrorHandler(error));
      }
    },
    [reset]
  );

  return {
    register,
    handleSubmit,
    onSubmit,
    errors,
    isSubmitting,
  };
};

export default useForgotPassword;
