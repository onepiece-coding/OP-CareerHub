/**
 * @file src/pages/dashboard/recruiter/recruiter-applications/index.tsx
 */

import type { QuerySchema } from "@/store/applications/actions/get-recruiter-jobs-applications";
import { Button, Card, Spinner, Table, type Column } from "@/components/ui";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { APP_STATUS, type Application } from "@/lib/types";
import { Link, useSearchParams } from "react-router-dom";
import { Link as ExternalLink } from "@/components/ui";
import {
  selectGetRecruiterApplicationsRecords,
  selectGetRecruiterApplicationsTotalPages,
  selectGetRecruiterJobsApplicationsError,
  selectGetRecruiterJobsApplicationsStatus,
  selectUpdateApplicationStatusError,
  selectUpdateApplicationStatusStatus,
} from "@/store/applications/applications-selectors";
import { useEffect, useRef, useState } from "react";
import {
  clearGetRecruiterJobsApplicationsState,
  clearUpdateApplicationStatusState,
  getRecruiterJobsApplications,
  setCurrentQueryKeyForRecruiterApplicationsCache,
} from "@/store/applications/applications-slice";
import { Pagination } from "@/components/common";
import { EyeIcon } from "@/components/icons";

import UpdateApplicationStatus from "./update-app-status.component";

const RecruiterApplications = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const relatedId = searchParams.get("relatedId");

  const getRecruiterJobsApplicationsErrorHeadingRef =
    useRef<HTMLHeadingElement>(null);
  const updateApplicationStatusErrorHeadingRef =
    useRef<HTMLHeadingElement>(null);

  const [pageNumber, setPageNumber] = useState(1);
  const [retry, setRetry] = useState(0);

  const totalPages = useAppSelector(selectGetRecruiterApplicationsTotalPages);

  const getRecruiterJobsApplicationsStatus = useAppSelector(
    selectGetRecruiterJobsApplicationsStatus,
  );
  const getRecruiterJobsApplicationsError = useAppSelector(
    selectGetRecruiterJobsApplicationsError,
  );
  const updateApplicationStatusStatus = useAppSelector(
    selectUpdateApplicationStatusStatus,
  );
  const updateApplicationStatusError = useAppSelector(
    selectUpdateApplicationStatusError,
  );
  const recruiterJobsApplications = useAppSelector(
    selectGetRecruiterApplicationsRecords,
  );

  console.log(recruiterJobsApplications);

  const dispatch = useAppDispatch();

  const columns: Column<Application>[] = [
    {
      key: "#",
      header: "#",
      render: (_, record, rowIndex) => {
        if (relatedId && record._id === relatedId) {
          return <EyeIcon stroke="#ffee58" width={20} />;
        }

        if (rowIndex + 1 < 10) return `0${rowIndex + 1}`;

        return rowIndex + 1;
      },
    },
    {
      header: "Company",
      key: "jobId.company",
    },
    {
      header: "Position",
      key: "jobId.position",
    },
    {
      header: "Status",
      key: "status",
    },
    {
      header: "Actions",
      key: "actions",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "12px" }}>
          <>
            <ExternalLink
              to={record.resume.url}
              variant="secondary"
              external
              download
            >
              Download
            </ExternalLink>

            {record.status !== APP_STATUS.ACCEPTED && (
              <UpdateApplicationStatus
                action="toBeAccepted"
                applicationId={record._id}
                jobId={record.jobId._id}
              />
            )}

            {record.status !== APP_STATUS.REJECTED && (
              <UpdateApplicationStatus
                action="toBeRejected"
                applicationId={record._id}
                jobId={record.jobId._id}
              />
            )}
          </>
        </div>
      ),
    },
  ];

  const handlePageChange = (newPage: number) => {
    setPageNumber(newPage);
  };

  useEffect(() => {
    const body: QuerySchema = {
      page: pageNumber,
      limit: 10,
    };

    if (relatedId) body._id = relatedId;

    dispatch(setCurrentQueryKeyForRecruiterApplicationsCache(body));

    const promise = dispatch(getRecruiterJobsApplications(body));

    return () => {
      promise?.abort();
      dispatch(clearGetRecruiterJobsApplicationsState());
      dispatch(clearUpdateApplicationStatusState());
      setSearchParams("");
    };
  }, [dispatch, retry, pageNumber, relatedId, setSearchParams]);

  // ✅ Shift focus to the new heading when state transitions
  useEffect(() => {
    if (
      getRecruiterJobsApplicationsStatus === "failed" &&
      getRecruiterJobsApplicationsError
    )
      getRecruiterJobsApplicationsErrorHeadingRef.current?.focus();
  }, [getRecruiterJobsApplicationsStatus, getRecruiterJobsApplicationsError]);

  // ✅ Shift focus to the new heading when state transitions
  useEffect(() => {
    if (
      updateApplicationStatusStatus === "failed" &&
      updateApplicationStatusError
    )
      updateApplicationStatusErrorHeadingRef.current?.focus();
  }, [updateApplicationStatusStatus, updateApplicationStatusError]);

  if (
    updateApplicationStatusStatus === "failed" &&
    updateApplicationStatusError
  ) {
    return (
      <>
        <title>CareerHub | Failed To Update Application Status</title>
        <Card>
          <Card.Header>
            <h1
              ref={updateApplicationStatusErrorHeadingRef}
              className="card-header-heading"
              tabIndex={-1}
            >
              Faild To Update Application Status
            </h1>
            <p className="card-header--subheading">
              {updateApplicationStatusError}
            </p>
          </Card.Header>
          <Card.Body>
            <Button
              onClick={() => {
                dispatch(clearUpdateApplicationStatusState());
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
    getRecruiterJobsApplicationsStatus === "idle" ||
    getRecruiterJobsApplicationsStatus === "pending"
  ) {
    return (
      <>
        <title>CareerHub | Recruiter Jobs Applications | Loading State</title>

        <Card className={`state`}>
          <Card.Body>
            <Spinner className={"state-spinner"} />
            <h2 className={"state-title"}>
              Get the recruiter jobs applications
            </h2>
            <p className={"state-desc"} style={{ marginBottom: 0 }}>
              Please wait while we get your jobs applications.
            </p>
          </Card.Body>
        </Card>
      </>
    );
  }

  if (getRecruiterJobsApplicationsStatus === "succeeded") {
    return (
      <>
        <title>CareerHub | Recruiter Jobs Applications</title>

        <div className="container">
          <Card style={{ width: "100%", maxWidth: "initial" }}>
            <Card.Header>
              <h1 className="card-header-heading">
                The recruiter jobs applications
              </h1>
              <p className="card-header--subheading">
                Review applications received for your job postings and select
                the best candidates.
              </p>
            </Card.Header>
            <Card.Body>
              <Table
                data={recruiterJobsApplications}
                columns={columns}
                rowKey="_id"
              />

              {totalPages > 1 && (
                <Pagination
                  handlePageChange={handlePageChange}
                  totalPages={totalPages}
                  pageNumber={pageNumber}
                />
              )}
            </Card.Body>
            {relatedId ? (
              <Card.Footer className={"to-footer"}>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    variant="slate"
                    onClick={() => {
                      setSearchParams("");
                    }}
                  >
                    Refresh
                  </Button>
                </div>
              </Card.Footer>
            ) : (
              <Card.Footer className={"to-footer"}>
                <p>
                  Get back to your jobs list?{" "}
                  <Link to="/dashboard/recruiter-jobs">here</Link>
                </p>
              </Card.Footer>
            )}
          </Card>
        </div>
      </>
    );
  }

  if (
    getRecruiterJobsApplicationsStatus === "failed" &&
    getRecruiterJobsApplicationsError
  ) {
    return (
      <>
        <title>CareerHub | Failed To Get Recruiter Jobs Applications</title>

        <Card>
          <Card.Header>
            <h1
              ref={getRecruiterJobsApplicationsErrorHeadingRef}
              className="card-header-heading"
              tabIndex={-1}
            >
              Get the recruiter jobs applications failed
            </h1>
            <p className="card-header--subheading">
              {getRecruiterJobsApplicationsError}
            </p>
          </Card.Header>
          <Card.Body>
            <Button
              onClick={() => {
                dispatch(clearGetRecruiterJobsApplicationsState());
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

export default RecruiterApplications;
