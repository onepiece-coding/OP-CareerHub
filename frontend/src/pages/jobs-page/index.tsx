/**
 * @file src/pages/jobs-page/index.tsx
 */

import {
  clearGetAllJobsState,
  getAllJobs,
  setCurrentQuery,
} from "@/store/jobs/jobs-slice";
import type { QuerySchema } from "@/store/jobs/actions/get-all-jobs";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Pagination, Search } from "@/components/common";
import { useEffect, useRef, useState } from "react";
import { APP_STATUS, type Job } from "@/lib/types";
import {
  selectAllJobs,
  selectGetAllJobsError,
  selectGetAllJobsStatus,
  selectTotalPages,
} from "@/store/jobs/jobs-selectors";
import {
  Button,
  Card,
  Link,
  Select,
  Spinner,
  Table,
  type Column,
} from "@/components/ui";

import styles from "./styles.module.css";
import ApplyJob from "./apply-in-job";
import {
  selectApplyInJobError,
  selectApplyInJobStatus,
} from "@/store/applications/applications-selectors";
import { clearApplyInJobState } from "@/store/applications/applications-slice";
import {
  selectIsAuthenticated,
  selectIsUser,
} from "@/store/auth/auth-selectors";

const JobsPage = () => {
  const getAllJobsErrorHeadingRef = useRef<HTMLHeadingElement>(null);
  const applyInJobErrorHeadingRef = useRef<HTMLHeadingElement>(null);

  const [retry, setRetry] = useState(0);

  const [sort, setSort] = useState<"a-z" | "z-a">("a-z");
  const [pageNumber, setPageNumber] = useState(1);
  const [jobType, setJobType] = useState<
    "" | "full-time" | "part-time" | "internship"
  >("");
  const [jobStatus, setJobStatus] = useState<
    "" | "pending" | "interview" | "declined"
  >("");
  const [search, setSearch] = useState("");

  const applyInJobStatus = useAppSelector(selectApplyInJobStatus);
  const getAllJobsStatus = useAppSelector(selectGetAllJobsStatus);
  const getAllJobsError = useAppSelector(selectGetAllJobsError);
  const applyInJobError = useAppSelector(selectApplyInJobError);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isUser = useAppSelector(selectIsUser);
  const totalPages = useAppSelector(selectTotalPages);
  const allJobs = useAppSelector(selectAllJobs);

  const dispatch = useAppDispatch();

  const columns: Column<Job>[] = [
    {
      header: "Job Vacancy",
      key: "jobVacancy",
    },
    {
      header: "Job Type",
      key: "jobType",
    },
    {
      header: "Job Deadline",
      key: "jobDeadline",
    },
    {
      header: "Job Location",
      key: "jobLocation",
    },
    {
      header: "Actions",
      key: "actions",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "12px" }}>
          <>
            {isAuthenticated &&
              isUser &&
              record.jobStatus === APP_STATUS.PENDING && (
                <ApplyJob
                  position={record.position}
                  company={record.company}
                  jobId={record._id}
                />
              )}
            <Link to={`/jobs/${record._id}/details`}>Details</Link>
          </>
        </div>
      ),
    },
  ];

  const handlePageChange = (newPage: number) => {
    setPageNumber(newPage);
  };

  const handleSearchChange = (searchTerm: string) => {
    setPageNumber(1);
    setSearch(searchTerm);
  };

  const handleSortChange = (sort: "a-z" | "z-a") => {
    setPageNumber(1);
    setSort(sort);
  };

  const handleJobTypeChange = (
    jobType: "" | "full-time" | "part-time" | "internship",
  ) => {
    setPageNumber(1);
    setJobType(jobType);
  };

  const handleJobStatusChange = (
    jobStatus: "" | "pending" | "interview" | "declined",
  ) => {
    setPageNumber(1);
    setJobStatus(jobStatus);
  };

  useEffect(() => {
    const querySchema: QuerySchema = {
      page: pageNumber,
      limit: 3,
      search,
      sort,
    };

    if (jobStatus) querySchema.jobStatus = jobStatus;
    if (jobType) querySchema.jobType = jobType;

    dispatch(setCurrentQuery(querySchema));

    const promise = dispatch(getAllJobs(querySchema));
    return () => {
      promise.abort();
      dispatch(clearGetAllJobsState());
    };
  }, [dispatch, pageNumber, search, sort, jobType, jobStatus, retry]);

  useEffect(() => {
    return () => {
      dispatch(clearApplyInJobState());
    };
  }, [dispatch]);

  // ✅ Shift focus to the new heading when state transitions
  useEffect(() => {
    if (getAllJobsStatus === "failed" && getAllJobsError)
      getAllJobsErrorHeadingRef.current?.focus();
  }, [getAllJobsStatus, getAllJobsError]);

  // ✅ Shift focus to the new heading when state transitions
  useEffect(() => {
    if (applyInJobStatus === "failed" && applyInJobError)
      applyInJobErrorHeadingRef.current?.focus();
  }, [applyInJobStatus, applyInJobError]);

  if (applyInJobStatus === "failed" && applyInJobError) {
    return (
      <>
        <title>CareerHub | Failed To Apply In Job</title>

        <div className="root">
          <Card>
            <Card.Header>
              <h1
                ref={applyInJobErrorHeadingRef}
                className="card-header-heading"
                tabIndex={-1}
              >
                Failed to apply in job
              </h1>
              <p className="card-header--subheading">{applyInJobError}</p>
            </Card.Header>
            <Card.Body>
              <Button
                onClick={() => {
                  dispatch(clearApplyInJobState());
                }}
              >
                Try Again
              </Button>
            </Card.Body>
          </Card>
        </div>
      </>
    );
  }

  if (getAllJobsStatus === "idle" || getAllJobsStatus === "pending") {
    return (
      <>
        <title>CareerHub | Get All Jobs | Loading State</title>

        <div className="root">
          <Card className={`state`}>
            <Card.Body>
              <Spinner className={"state-spinner"} />
              <h2 className={"state-title"}>Get all jobs</h2>
              <p className={"state-desc"} style={{ marginBottom: 0 }}>
                Please wait while we get all jobs.
              </p>
            </Card.Body>
          </Card>
        </div>
      </>
    );
  }

  if (getAllJobsStatus === "succeeded") {
    return (
      <>
        <title>CareerHub | Jobs Page</title>
        <div className="root">
          <div className="container">
            <Card style={{ width: "100%", maxWidth: "initial" }}>
              <Card.Header>
                <h1 className="card-header-heading">All Jobs</h1>
                <p className="card-header--subheading">
                  Discover open positions and find the right opportunity for
                  your career.
                </p>
              </Card.Header>
              <Card.Body>
                <Search
                  handleSearchChange={handleSearchChange}
                  label={"Search Term"}
                  initialValue={search}
                />

                <div className={styles.row}>
                  <Select
                    id="sort"
                    value={sort}
                    onChange={handleSortChange}
                    options={[
                      {
                        label: "A-Z",
                        value: "a-z",
                      },
                      {
                        label: "Z-A",
                        value: "z-a",
                      },
                    ]}
                  />

                  <Select
                    id="jobType"
                    value={jobType}
                    onChange={handleJobTypeChange}
                    options={[
                      {
                        label: "All",
                        value: "",
                      },
                      {
                        label: "Full Time",
                        value: "full-time",
                      },
                      {
                        label: "Part Time",
                        value: "part-time",
                      },
                      {
                        label: "Internship",
                        value: "internship",
                      },
                    ]}
                  />

                  <Select
                    id="jobStatus"
                    value={jobStatus}
                    onChange={handleJobStatusChange}
                    options={[
                      {
                        label: "All",
                        value: "",
                      },
                      {
                        label: "Pending",
                        value: "pending",
                      },
                      {
                        label: "Interview",
                        value: "interview",
                      },
                      {
                        label: "Declined",
                        value: "declined",
                      },
                    ]}
                  />
                </div>

                <Table columns={columns} data={allJobs} rowKey="_id" />

                {totalPages > 0 && (
                  <Pagination
                    handlePageChange={handlePageChange}
                    totalPages={totalPages}
                    pageNumber={pageNumber}
                  />
                )}
              </Card.Body>
            </Card>
          </div>
        </div>
      </>
    );
  }

  if (getAllJobsStatus === "failed" && getAllJobsError) {
    return (
      <>
        <title>CareerHub | Get All Jobs | Failed Status</title>

        <div className="root">
          <Card>
            <Card.Header>
              <h1
                ref={getAllJobsErrorHeadingRef}
                className="card-header-heading"
                tabIndex={-1}
              >
                Get all jobs failed
              </h1>
              <p className="card-header--subheading">{getAllJobsError}</p>
            </Card.Header>
            <Card.Body>
              <Button
                onClick={() => {
                  dispatch(clearGetAllJobsState());
                  setRetry((prev) => prev + 1);
                }}
              >
                Try Again
              </Button>
            </Card.Body>
          </Card>
        </div>
      </>
    );
  }
};

export default JobsPage;
