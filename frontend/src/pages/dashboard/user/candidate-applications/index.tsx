/**
 * @file src/pages/dashboard/user/candidate-applications/index.tsx
 */

import { Button, Card, Spinner, Table, type Column } from "@/components/ui";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useEffect, useRef, useState } from "react";
import { Pagination } from "@/components/common";
import { type Application } from "@/lib/types";
import {
  selectGetCandidateApplicationsError,
  selectGetCandidateApplicationsRecords,
  selectGetCandidateApplicationsStatus,
  selectGetCandidateApplicationsTotalPages,
} from "@/store/applications/applications-selectors";
import {
  clearGetCandidateApplicationsState,
  getCandidateApplications,
  setCurrentQueryKeyForUserApplicationsCache,
} from "@/store/applications/applications-slice";
import { useSearchParams } from "react-router-dom";
import { EyeIcon } from "@/components/icons";
import type { QuerySchema } from "@/store/applications/actions/get-candidate-applications";

const CandidateApplications = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const relatedId = searchParams.get("relatedId");

  const getCandidateApplicationsErrorHeadingRef =
    useRef<HTMLHeadingElement>(null);

  const [pageNumber, setPageNumber] = useState(1);
  const [retry, setRetry] = useState(0);

  const totalPages = useAppSelector(selectGetCandidateApplicationsTotalPages);
  const getCandidateApplicationsStatus = useAppSelector(
    selectGetCandidateApplicationsStatus,
  );
  const getCandidateApplicationsError = useAppSelector(
    selectGetCandidateApplicationsError,
  );
  const candidateApplications = useAppSelector(
    selectGetCandidateApplicationsRecords,
  );

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
      key: "jobId.company",
      header: "Company",
    },
    {
      key: "jobId.position",
      header: "Position",
    },
    {
      header: "Decision",
      key: "status",
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

    dispatch(setCurrentQueryKeyForUserApplicationsCache(body));

    const promise = dispatch(getCandidateApplications(body));
    return () => {
      promise.abort();
      dispatch(clearGetCandidateApplicationsState());
      setSearchParams("");
    };
  }, [dispatch, pageNumber, retry, relatedId, setSearchParams]);

  // ✅ Shift focus to the new heading when state transitions
  useEffect(() => {
    if (
      getCandidateApplicationsStatus === "failed" &&
      getCandidateApplicationsError
    )
      getCandidateApplicationsErrorHeadingRef.current?.focus();
  }, [getCandidateApplicationsStatus, getCandidateApplicationsError]);

  if (
    getCandidateApplicationsStatus === "idle" ||
    getCandidateApplicationsStatus === "pending"
  ) {
    return (
      <>
        <title>CareerHub | Candidate Applications | Loading State</title>

        <Card className={`state`}>
          <Card.Body>
            <Spinner className={"state-spinner"} />
            <h2 className={"state-title"}>Get Candidate Applications</h2>
            <p className={"state-desc"} style={{ marginBottom: 0 }}>
              Please wait while we get your Candidate Applications.
            </p>
          </Card.Body>
        </Card>
      </>
    );
  }

  if (getCandidateApplicationsStatus === "succeeded") {
    return (
      <>
        <title>CareerHub | Candidate Applications</title>
        <div className="container">
          <Card style={{ width: "100%", maxWidth: "initial" }}>
            <Card.Header>
              <h1 className="card-header-heading">Candidate Applications</h1>
              <p className="card-header--subheading">
                Track your submitted applications and monitor their status.
              </p>
            </Card.Header>
            <Card.Body>
              <Table
                data={candidateApplications}
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
            {relatedId && (
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
            )}
          </Card>
        </div>
      </>
    );
  }

  if (
    getCandidateApplicationsStatus === "failed" &&
    getCandidateApplicationsError
  ) {
    return (
      <>
        <title>CareerHub | Candidate Applications | Failed State</title>

        <Card>
          <Card.Header>
            <h1
              ref={getCandidateApplicationsErrorHeadingRef}
              className="card-header-heading"
              tabIndex={-1}
            >
              Get your Candidate Applications failed
            </h1>
            <p className="card-header--subheading">
              {getCandidateApplicationsError}
            </p>
          </Card.Header>
          <Card.Body>
            <Button
              onClick={() => {
                dispatch(clearGetCandidateApplicationsState());
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

export default CandidateApplications;
