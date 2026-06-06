/**
 * @file src/pages/dashboard/recruiter/edit-recruiter-job/index.tsx
 */

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Button, Card, Spinner } from "@/components/ui";
import { useParams } from "react-router-dom";
import { useEffect, useRef } from "react";
import {
  selectGetSingleJobError,
  selectGetSingleJobStatus,
  selectSingleJob,
} from "@/store/jobs/jobs-selectors";
import {
  clearUpdateSingleJobState,
  clearGetSingleJobState,
  clearSingleJob,
  getSingleJob,
} from "@/store/jobs/jobs-slice";

import EditJobForm from "./edit-job-form.component";

const EditRecruiterJob = () => {
  const { jobId } = useParams();

  const getSingleJobErrorHeadingRef = useRef<HTMLHeadingElement>(null);

  const getSingleJobStatus = useAppSelector(selectGetSingleJobStatus);
  const getSingleJobError = useAppSelector(selectGetSingleJobError);
  const singleJob = useAppSelector(selectSingleJob);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!jobId) return;
    const promise = dispatch(getSingleJob({ jobId, type: "recruiterJobs" }));

    return () => {
      promise?.abort();
      dispatch(clearUpdateSingleJobState());
      dispatch(clearGetSingleJobState());
      dispatch(clearSingleJob()); // ✅ wipe stale job so next edit starts clean
    };
  }, [dispatch, jobId]);

  useEffect(() => {
    if (getSingleJobStatus === "failed" && getSingleJobError)
      getSingleJobErrorHeadingRef.current?.focus();
  }, [getSingleJobStatus, getSingleJobError]);

  if (getSingleJobStatus === "idle" || getSingleJobStatus === "pending") {
    return (
      <>
        <title>CareerHub | Edit Job | Loading State</title>
        <Card className="state">
          <Card.Body>
            <Spinner className="state-spinner" />
            <h2 className="state-title">Loading job</h2>
            <p className="state-desc" style={{ marginBottom: 0 }}>
              Please wait while we fetch the job details.
            </p>
          </Card.Body>
        </Card>
      </>
    );
  }

  if (getSingleJobStatus === "succeeded" && singleJob) {
    return (
      // key={recruiterJob._id} guarantees a full remount if the user somehow
      // lands on a different job's edit page without the route unmounting.
      <EditJobForm key={singleJob._id} job={singleJob} jobId={jobId!} />
    );
  }

  if (getSingleJobStatus === "failed" && getSingleJobError) {
    return (
      <>
        <title>CareerHub | Edit Job | Failed State</title>
        <Card>
          <Card.Header>
            <h1
              ref={getSingleJobErrorHeadingRef}
              className="card-header-heading"
              tabIndex={-1}
            >
              Failed to load job
            </h1>
            <p className="card-header--subheading">{getSingleJobError}</p>
          </Card.Header>
          <Card.Body>
            <Button onClick={() => dispatch(clearGetSingleJobState())}>
              Try Again
            </Button>
          </Card.Body>
        </Card>
      </>
    );
  }
};

export default EditRecruiterJob;
