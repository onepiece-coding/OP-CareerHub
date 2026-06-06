/**
 * @file src/pages/dashboard/recruiter/add-recruiter-job/index.tsx
 */

import { JOB_STATUS_OPTIONS, JOB_TYPE_OPTIONS } from "@/lib/constants";
import { addJob, clearAddJobState } from "@/store/jobs/jobs-slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addJobSchema, type JobValues } from "@/validations";
import { addToast } from "@/store/toasts/toasts-slice";
import { Link, useNavigate } from "react-router-dom";
import { FormField } from "@/components/forms";
import { Button, Card } from "@/components/ui";
import { useEffect, useRef } from "react";
import { todayISO } from "@/lib/utils";
import { useForm } from "@/hooks";
import {
  selectAddJobError,
  selectAddJobStatus,
} from "@/store/jobs/jobs-selectors";

const AddRecruiterJob = () => {
  const errorHeadingRef = useRef<HTMLHeadingElement>(null);

  const addJobStatus = useAppSelector(selectAddJobStatus);
  const addJobError = useAppSelector(selectAddJobError);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    errors,
    touched,
    isSubmitting,
    register,
    registerSelect,
    registerTags,
    registerDate,
    handleSubmit,
    reset,
  } = useForm<JobValues>(addJobSchema, {
    jobFacilities: [],
    jobDescription: "",
    jobLocation: "",
    jobDeadline: "",
    jobSkills: [],
    jobContact: "",
    jobVacancy: "",
    jobSalary: "",
    jobStatus: "",
    position: "",
    company: "",
    jobType: "",
  });

  const onSubmit = async (data: JobValues) => {
    try {
      await dispatch(addJob(data)).unwrap();

      dispatch(
        addToast({
          type: "success",
          message: "Job successfully added",
        }),
      );

      reset();
      navigate(`/dashboard/recruiter-jobs`, { replace: true });
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Add job failed:", error);
      }
    }
  };

  useEffect(() => {
    return () => {
      dispatch(clearAddJobState());
    };
  }, [dispatch]);

  // ✅ Shift focus to the new heading when state transitions
  useEffect(() => {
    if (addJobStatus === "failed" && addJobError)
      errorHeadingRef.current?.focus();
  }, [addJobStatus, addJobError]);

  if (addJobStatus === "failed" && addJobError) {
    return (
      <>
        <title>CareerHub | Add A Job | Add A Job Failed</title>

        <Card>
          <Card.Header>
            <h1
              className="card-header-heading"
              ref={errorHeadingRef}
              tabIndex={-1}
            >
              Add a job failed
            </h1>
            <p className="card-header--subheading">{addJobError}</p>
          </Card.Header>

          <Card.Body>
            <Button
              onClick={() => {
                dispatch(clearAddJobState());
                reset();
              }}
            >
              Try to add a job again
            </Button>
          </Card.Body>
        </Card>
      </>
    );
  }

  return (
    <>
      <title>CareerHub | Add A Job</title>
      <Card style={{ maxWidth: "initial", width: "100%" }}>
        <Card.Header>
          <h1 className="card-header-heading">Add A Job</h1>
          <p className="card-header--subheading">
            Create a new job post and reach the right candidates faster.
          </p>
        </Card.Header>
        <Card.Body>
          <form onSubmit={handleSubmit(onSubmit)} className={"form"} noValidate>
            <div className={"form-group"}>
              {/* Company */}
              <FormField
                touched={touched.company}
                {...register("company")}
                error={errors.company}
                autoComplete="off"
                label="Company"
                type="text"
                required
              />
              {/* Position */}
              <FormField
                touched={touched.position}
                {...register("position")}
                error={errors.position}
                autoComplete="off"
                label="Position"
                type="text"
                required
              />
            </div>
            <div className={"form-group"}>
              {/* Job Status */}
              <FormField
                placeholder="Select a Job Status..."
                {...registerSelect("jobStatus")}
                options={JOB_STATUS_OPTIONS}
                touched={touched.jobStatus}
                error={errors.jobStatus}
                label="Job Status"
                type="select"
                required
              />
              {/* Job Type */}
              <FormField
                placeholder="Select a Job Type..."
                {...registerSelect("jobType")}
                options={JOB_TYPE_OPTIONS}
                touched={touched.jobType}
                error={errors.jobType}
                label="Job Type"
                type="select"
                required
              />
            </div>
            <div className={"form-group"}>
              {/* Job Location */}
              <FormField
                touched={touched.jobLocation}
                {...register("jobLocation")}
                error={errors.jobLocation}
                label="Job Location"
                autoComplete="off"
                type="text"
                required
              />
              {/* Job Vacancy */}
              <FormField
                touched={touched.jobVacancy}
                {...register("jobVacancy")}
                error={errors.jobVacancy}
                label="Job Vacancy"
                autoComplete="off"
                type="text"
                required
              />
            </div>
            <div className={"form-group"}>
              {/* Job Salary */}
              <FormField
                touched={touched.jobSalary}
                {...register("jobSalary")}
                error={errors.jobSalary}
                label="Job Salary"
                autoComplete="off"
                type="number"
                required
              />
              {/* Job Deadline */}
              <FormField
                {...registerDate("jobDeadline")}
                touched={touched.jobDeadline}
                error={errors.jobDeadline}
                minDate={todayISO()}
                label="Job Deadline"
                type="date"
                required
              />
            </div>
            <div className={"form-group"}>
              {/* Job Skills */}
              <FormField
                placeholder="Select Job Skills..."
                {...registerTags("jobSkills")}
                touched={touched.jobSkills}
                error={errors.jobSkills}
                label="Job Skills"
                type="tags"
                required
              />
              {/* Job Facilities */}
              <FormField
                placeholder="Select Job Facilities..."
                {...registerTags("jobFacilities")}
                touched={touched.jobFacilities}
                error={errors.jobFacilities}
                label="Job Facilities"
                type="tags"
                required
              />
            </div>
            <div className={"form-group"}>
              {/* Job Contact */}
              <FormField
                touched={touched.jobContact}
                {...register("jobContact")}
                error={errors.jobContact}
                label="Job Contact"
                autoComplete="off"
                type="text"
                required
              />
              {/* Job Description */}
              <FormField
                touched={touched.jobDescription}
                {...register("jobDescription")}
                error={errors.jobDescription}
                label="Job Description"
                autoComplete="off"
                type="text"
                required
              />
            </div>
            {/* Submit */}
            <Button
              ariaBusy={isSubmitting}
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Adding..." : "Add"}
            </Button>
          </form>
        </Card.Body>
        <Card.Footer className={"to-footer"}>
          <p>
            Get back to your jobs list?{" "}
            <Link to="/dashboard/recruiter-jobs">here</Link>
          </p>
        </Card.Footer>
      </Card>
    </>
  );
};

export default AddRecruiterJob;
