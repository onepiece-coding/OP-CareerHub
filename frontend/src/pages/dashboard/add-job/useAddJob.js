import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { jobSchema } from "../../../validations/jobSchema";
import { useForm } from "react-hook-form";
import { axiosInstance } from "../../../api/axiosInstance";
import { axiosErrorHandler } from "../../../api/axiosErrorHandler";
import { toast } from "react-toastify";

const useAddJob = () => {
  const navigate = useNavigate();

  const [deadline, setDeadline] = useState(new Date());
  const [skills, setSkills] = useState([]);
  const [facilities, setFacilities] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(jobSchema),
  });

  const onSubmit = async (data) => {
    const formData = {
      ...data,
      jobDeadline: deadline,
      jobSkills: skills,
      jobFacilities: facilities,
    };

    try {
      await axiosInstance.post("/api/v1/jobs", formData);
      toast.success("Nouvel emploi ajouté avec succès");
      reset();
      navigate("/dashboard/manage-jobs");
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
    deadline,
    setDeadline,
    skills,
    setSkills,
    facilities,
    setFacilities,
  };
};

export default useAddJob;
