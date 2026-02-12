import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { resetPasswordSchema } from "../../../validations/resetPasswordSchema";
import { axiosInstance } from "../../../api/axiosInstance";
import { axiosErrorHandler } from "../../../api/axiosErrorHandler";
import { toast } from "react-toastify";

const useResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();

  const [state, setState] = useState({
    isValid: true,
    loading: false,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onBlur",
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data) => {
    const { password } = data;

    try {
      const { data } = await axiosInstance.post(
        `/api/v1/password/reset-password/${token}`,
        { password }
      );
      toast.success(data.message);
      reset();
      navigate("/login");
    } catch (error) {
      toast.error(axiosErrorHandler(error));
    }
  };

  useEffect(() => {
    const isValidURL = async () => {
      setState((prev) => ({ ...prev, loading: true }));
      try {
        await axiosInstance.get(`/api/v1/password/reset-password/${token}`);
      } catch {
        setState((prev) => ({ ...prev, isValid: false }));
      } finally {
        setState((prev) => ({ ...prev, loading: false }));
      }
    };
    isValidURL();
  }, [token]);

  return { register, handleSubmit, onSubmit, state, errors, isSubmitting };
};

export default useResetPassword;
