import { useEffect, useState } from "react";
import { axiosErrorHandler } from "../../../api/axiosErrorHandler";
import { axiosInstance } from "../../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { jobSchema } from "../../../validations/jobSchema";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

const useEditJob = (jobId) => {
  const navigate = useNavigate();

  const [recruiterJob, setRecruiterJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const [deadline, setDeadline] = useState(new Date());
  const [skills, setSkills] = useState([]);
  const [facilities, setFacilities] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      position: recruiterJob?.position,
    },
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
      await axiosInstance.patch(`/api/v1/jobs/${recruiterJob?._id}`, formData);
      toast.success("Job Updated successfully");
      reset();
      navigate("/dashboard/manage-jobs");
    } catch (error) {
      toast.error(axiosErrorHandler(error));
    }
  };

  useEffect(() => {
    const fetchRecruiterJob = async () => {
      setLoading(true);

      try {
        const { data } = await axiosInstance.get(`/api/v1/jobs/${jobId}`);
        setRecruiterJob(data?.result);
      } catch (error) {
        setError(axiosErrorHandler(error));
      } finally {
        setLoading(false);
      }
    };

    fetchRecruiterJob();
  }, [jobId]);

  useEffect(() => {
    if (recruiterJob && Object.keys(recruiterJob).length > 0) {
      reset({
        position: recruiterJob.position,
        company: recruiterJob.company,
        jobLocation: recruiterJob.jobLocation,
        jobStatus: recruiterJob.jobStatus,
        jobType: recruiterJob.jobType,
        jobVacancy: recruiterJob.jobVacancy,
        jobSalary: recruiterJob.jobSalary,
        jobContact: recruiterJob.jobContact,
        jobDescription: recruiterJob.jobDescription,
      });
      setSkills(recruiterJob.jobSkills || []);
      setFacilities(recruiterJob.jobFacilities || []);
      setDeadline(recruiterJob.jobDeadline || new Date());
    }
  }, [recruiterJob, reset]);

  return {
    loading,
    error,
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

export default useEditJob;
