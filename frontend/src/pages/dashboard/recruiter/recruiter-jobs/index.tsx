/**
 * @file src/pages/dashboard/recruiter/recruiter-jobs/index.tsx
 */

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { EyeIcon, PencilSquareIcon } from "@/components/icons";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { Job } from "@/lib/types";
import {
  selectGetRecruiterJobsStatus,
  selectGetRecruiterJobsError,
  selectRecruiterJobs,
  selectDeleteRecruiterJobError,
  selectDeleteRecruiterJobStatus,
} from "@/store/jobs/jobs-selectors";
import {
  clearDeleteRecruiterJobState,
  clearGetRecruiterJobsState,
  getRecruiterJobs,
} from "@/store/jobs/jobs-slice";
import {
  Badge,
  Button,
  Card,
  Spinner,
  Table,
  type Column,
} from "@/components/ui";

import DeleteRecruiterJob from "./delete-recruiter-job.component";

const RecruiterJobs = () => {
  const deleteRecruiterJobErrorHeadingRef = useRef<HTMLHeadingElement>(null);
  const getRecruiterJobsErrorHeadingRef = useRef<HTMLHeadingElement>(null);

  const [retry, setRetry] = useState(0);

  const deleteRecruiterJobError = useAppSelector(selectDeleteRecruiterJobError);
  const getRecruiterJobsStatus = useAppSelector(selectGetRecruiterJobsStatus);
  const getRecruiterJobsError = useAppSelector(selectGetRecruiterJobsError);
  const recruiterJobs = useAppSelector(selectRecruiterJobs);
  const deleteRecruiterJobStatus = useAppSelector(
    selectDeleteRecruiterJobStatus,
  );

  const dispatch = useAppDispatch();

  const columns: Column<Job>[] = [
    {
      key: "#",
      header: "#",
      render: (_, __, rowIndex) => {
        if (rowIndex + 1 < 10) return `0${rowIndex + 1}`;
        return rowIndex + 1;
      },
    },
    {
      key: "company",
      header: "Company",
    },
    {
      header: "Position",
      key: "position",
    },
    {
      header: "Job Vacancy",
      key: "jobVacancy",
    },
    {
      header: "Job Status",
      key: "jobStatus",
    },
    {
      header: "Job Type",
      key: "jobType",
    },
    {
      header: "Actions",
      key: "actions",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "12px" }}>
          <>
            <Link to={`/jobs/${record._id}/details`}>
              <Badge variant="yellow">
                <EyeIcon />
              </Badge>
            </Link>
            <Link to={`/dashboard/recruiter-jobs/${record._id}/edit`}>
              <Badge variant="emerald">
                <PencilSquareIcon />
              </Badge>
            </Link>
            <DeleteRecruiterJob company={record.company} jobId={record._id} />
          </>
        </div>
      ),
    },
  ];

  useEffect(() => {
    const promise = dispatch(getRecruiterJobs());

    return () => {
      promise?.abort();
      dispatch(clearGetRecruiterJobsState());
      dispatch(clearDeleteRecruiterJobState());
    };
  }, [dispatch, retry]);

  // ✅ Shift focus to the new heading when state transitions
  useEffect(() => {
    if (getRecruiterJobsStatus === "failed" && getRecruiterJobsError)
      getRecruiterJobsErrorHeadingRef.current?.focus();
  }, [getRecruiterJobsStatus, getRecruiterJobsError]);

  // ✅ Shift focus to the new heading when state transitions
  useEffect(() => {
    if (deleteRecruiterJobStatus === "failed" && deleteRecruiterJobError)
      deleteRecruiterJobErrorHeadingRef.current?.focus();
  }, [deleteRecruiterJobStatus, deleteRecruiterJobError]);

  if (deleteRecruiterJobStatus === "failed" && deleteRecruiterJobError) {
    return (
      <>
        <title>CareerHub | Recruiter Jobs | Delete Job Failed</title>
        <Card>
          <Card.Header>
            <h1
              ref={deleteRecruiterJobErrorHeadingRef}
              className="card-header-heading"
              tabIndex={-1}
            >
              Delete job failed
            </h1>
            <p className="card-header--subheading">{deleteRecruiterJobError}</p>
          </Card.Header>
          <Card.Body>
            <Button
              onClick={() => {
                dispatch(clearDeleteRecruiterJobState());
              }}
            >
              Try Again
            </Button>
          </Card.Body>
        </Card>
      </>
    );
  }

  if (
    getRecruiterJobsStatus === "idle" ||
    getRecruiterJobsStatus === "pending"
  ) {
    return (
      <>
        <title>CareerHub | Recruiter Jobs | Loading State</title>

        <Card className={`state`}>
          <Card.Body>
            <Spinner className={"state-spinner"} />
            <h2 className={"state-title"}>Get the recruiter jobs</h2>
            <p className={"state-desc"} style={{ marginBottom: 0 }}>
              Please wait while we get your jobs.
            </p>
          </Card.Body>
        </Card>
      </>
    );
  }

  if (getRecruiterJobsStatus === "succeeded") {
    return (
      <>
        <title>CareerHub | Recruiter Jobs</title>

        <div className="container">
          <Card style={{ width: "100%", maxWidth: "initial" }}>
            <Card.Header>
              <h1 className="card-header-heading">All the recruiter jobs</h1>
              <p className="card-header--subheading">
                Manage all your posted jobs and track their performance easily.
              </p>
            </Card.Header>
            <Card.Body>
              <Table columns={columns} data={recruiterJobs} rowKey="_id" />
            </Card.Body>
            <Card.Footer className={"to-footer"}>
              <p>
                Add a job to your jobs list?{" "}
                <Link to="/dashboard/add-job">here</Link>
              </p>
            </Card.Footer>
          </Card>
        </div>
      </>
    );
  }

  if (getRecruiterJobsStatus === "failed" && getRecruiterJobsError) {
    return (
      <>
        <title>CareerHub | Recruiter Jobs | Get Jobs Failed</title>

        <Card>
          <Card.Header>
            <h1
              ref={getRecruiterJobsErrorHeadingRef}
              className="card-header-heading"
              tabIndex={-1}
            >
              get the recruiter jobs failed
            </h1>
            <p className="card-header--subheading">{getRecruiterJobsError}</p>
          </Card.Header>
          <Card.Body>
            <Button
              onClick={() => {
                dispatch(clearGetRecruiterJobsState());
                setRetry((prev) => prev + 1);
              }}
            >
              Try Again
            </Button>
          </Card.Body>
        </Card>
      </>
    );
  }
};

export default RecruiterJobs;
