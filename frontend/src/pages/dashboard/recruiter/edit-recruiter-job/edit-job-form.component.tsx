/**
 * @file src/pages/dashboard/recruiter/edit-recruiter-job/edit-job-form.component.tsx
 */

import { JOB_STATUS_OPTIONS, JOB_TYPE_OPTIONS } from "@/lib/constants";
import { updateJobSchema, type JobValues } from "@/validations";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToast } from "@/store/toasts/toasts-slice";
import { Link, useNavigate } from "react-router-dom";
import { FormField } from "@/components/forms";
import { Button, Card } from "@/components/ui";
import { useEffect, useRef } from "react";
import type { Job } from "@/lib/types";
import { todayISO } from "@/lib/utils";
import {
  selectUpdateSingleJobError,
  selectUpdateSingleJobStatus,
} from "@/store/jobs/jobs-selectors";
import { useForm } from "@/hooks";
import {
  clearUpdateSingleJobState,
  updateSingleJob,
} from "@/store/jobs/jobs-slice";

// ─────────────────────────────────────────────────────────────────────────────
// Form sub-component — only mounts after job data is confirmed available.
// This guarantees useForm's useState captures real values, not empty strings.
// The `key={job._id}` at the call site forces a full remount if the job
// changes (e.g. browser back/forward without unmounting the route).
// ─────────────────────────────────────────────────────────────────────────────

interface EditJobFormProps {
  jobId: string;
  job: Job;
}

const EditJobForm = ({ job, jobId }: EditJobFormProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const updateSingleJobStatus = useAppSelector(selectUpdateSingleJobStatus);
  const updateSingleJobError = useAppSelector(selectUpdateSingleJobError);
  const updateErrorRef = useRef<HTMLHeadingElement>(null);

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
  } = useForm<JobValues>(updateJobSchema, {
    // ✅ job is guaranteed non-null here — no || "" fallbacks hiding missing data
    jobFacilities: job.jobFacilities ?? [],
    jobDescription: job.jobDescription ?? "",
    jobLocation: job.jobLocation ?? "",
    jobDeadline: job.jobDeadline ?? "",
    jobSkills: job.jobSkills ?? [],
    jobContact: job.jobContact ?? "",
    jobVacancy: job.jobVacancy ?? "",
    jobSalary: job.jobSalary ?? "",
    jobStatus: job.jobStatus ?? "",
    position: job.position ?? "",
    company: job.company ?? "",
    jobType: job.jobType ?? "",
  });

  const onSubmit = async (data: JobValues) => {
    const body: Partial<JobValues> = {};

    if (data.jobDescription) body.jobDescription = data.jobDescription;
    if (data.jobFacilities) body.jobFacilities = data.jobFacilities;
    if (data.jobDeadline) body.jobDeadline = data.jobDeadline;
    if (data.jobLocation) body.jobLocation = data.jobLocation;
    if (data.jobContact) body.jobContact = data.jobContact;
    if (data.jobVacancy) body.jobVacancy = data.jobVacancy;
    if (data.jobSkills) body.jobSkills = data.jobSkills;
    if (data.jobSalary) body.jobSalary = data.jobSalary;
    if (data.jobStatus) body.jobStatus = data.jobStatus;
    if (data.position) body.position = data.position;
    if (data.company) body.company = data.company;
    if (data.jobType) body.jobType = data.jobType;

    try {
      await dispatch(updateSingleJob({ jobId, data: body })).unwrap();
      dispatch(
        addToast({ type: "success", message: "Job successfully updated" }),
      );
      reset();
      navigate("/dashboard/recruiter-jobs", { replace: true });
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Update job failed:", error);
      }
    }
  };

  useEffect(() => {
    if (updateSingleJobStatus === "failed" && updateSingleJobError)
      updateErrorRef.current?.focus();
  }, [updateSingleJobStatus, updateSingleJobError]);

  if (updateSingleJobStatus === "failed" && updateSingleJobError) {
    return (
      <>
        <title>CareerHub | Edit Job Failed</title>
        <Card>
          <Card.Header>
            <h1
              ref={updateErrorRef}
              className="card-header-heading"
              tabIndex={-1}
            >
              Edit job failed
            </h1>
            <p className="card-header--subheading">{updateSingleJobError}</p>
          </Card.Header>
          <Card.Body>
            <Button onClick={() => dispatch(clearUpdateSingleJobState())}>
              Try again
            </Button>
          </Card.Body>
        </Card>
      </>
    );
  }

  return (
    <>
      <title>CareerHub | Edit Job</title>
      <Card style={{ maxWidth: "initial", width: "100%" }}>
        <Card.Header>
          <h1 className="card-header-heading">Edit Job</h1>
          <p className="card-header--subheading">
            Update your job posting details to keep it accurate and up to date.
          </p>
        </Card.Header>
        <Card.Body>
          <form onSubmit={handleSubmit(onSubmit)} className="form" noValidate>
            <div className="form-group">
              <FormField
                touched={touched.company}
                {...register("company")}
                error={errors.company}
                autoComplete="off"
                label="Company"
                type="text"
                required
              />
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
            <div className="form-group">
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
            <div className="form-group">
              <FormField
                touched={touched.jobLocation}
                {...register("jobLocation")}
                error={errors.jobLocation}
                autoComplete="off"
                label="Job Location"
                type="text"
                required
              />
              <FormField
                touched={touched.jobVacancy}
                {...register("jobVacancy")}
                error={errors.jobVacancy}
                autoComplete="off"
                label="Job Vacancy"
                type="text"
                required
              />
            </div>
            <div className="form-group">
              <FormField
                touched={touched.jobSalary}
                {...register("jobSalary")}
                error={errors.jobSalary}
                autoComplete="off"
                label="Job Salary"
                type="number"
                required
              />
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
            <div className="form-group">
              <FormField
                placeholder="Add job skills..."
                {...registerTags("jobSkills")}
                touched={touched.jobSkills}
                error={errors.jobSkills}
                label="Job Skills"
                type="tags"
                required
              />
              <FormField
                placeholder="Add job facilities..."
                {...registerTags("jobFacilities")}
                touched={touched.jobFacilities}
                error={errors.jobFacilities}
                label="Job Facilities"
                type="tags"
                required
              />
            </div>
            <div className="form-group">
              <FormField
                touched={touched.jobContact}
                {...register("jobContact")}
                error={errors.jobContact}
                autoComplete="off"
                label="Job Contact"
                type="text"
                required
              />
              <FormField
                touched={touched.jobDescription}
                {...register("jobDescription")}
                error={errors.jobDescription}
                autoComplete="off"
                label="Job Description"
                type="text"
                required
              />
            </div>
            <Button
              ariaBusy={isSubmitting}
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Updating..." : "Update"}
            </Button>
          </form>
        </Card.Body>
        <Card.Footer className="to-footer">
          <p>
            Get back to your jobs list?{" "}
            <Link to="/dashboard/recruiter-jobs">here</Link>
          </p>
        </Card.Footer>
      </Card>
    </>
  );
};

export default EditJobForm;
