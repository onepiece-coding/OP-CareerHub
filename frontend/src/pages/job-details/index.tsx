/**
 * @file src/pages/job-details/index.tsx
 */

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Button, Card, Spinner } from "@/components/ui";
import { Link, useParams } from "react-router-dom";
import { InfoCard } from "@/components/common";
import { useEffect, useRef } from "react";
import {
  selectGetSingleJobError,
  selectGetSingleJobStatus,
  selectSingleJob,
} from "@/store/jobs/jobs-selectors";
import {
  clearGetSingleJobState,
  clearSingleJob,
  getSingleJob,
} from "@/store/jobs/jobs-slice";
import {
  ArrowRightEndOnRectangleIcon,
  CreditCardIcon,
  DocumentMagnifyingGlassIcon,
  IdentificationIcon,
  ListBulletIcon,
  WrenchScrewdriverIcon,
} from "@/components/icons";

import styles from "./styles.module.css";

const JobDetails = () => {
  const { jobId } = useParams();

  const getSingleJobErrorHeadingRef = useRef<HTMLHeadingElement>(null);

  const getSingleJobStatus = useAppSelector(selectGetSingleJobStatus);
  const getSingleJobError = useAppSelector(selectGetSingleJobError);
  const singleJob = useAppSelector(selectSingleJob);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!jobId) return;

    const promise = dispatch(getSingleJob({ jobId, type: "allJobs" }));

    return () => {
      promise?.abort();
      dispatch(clearGetSingleJobState());
      dispatch(clearSingleJob());
    };
  }, [dispatch, jobId]);

  useEffect(() => {
    if (getSingleJobStatus === "failed" && getSingleJobError)
      getSingleJobErrorHeadingRef.current?.focus();
  }, [getSingleJobStatus, getSingleJobError]);

  if (getSingleJobStatus === "idle" || getSingleJobStatus === "pending") {
    return (
      <>
        <title>CareerHub | Get A Single Job | Loading State</title>

        <div className="root">
          <Card className="state">
            <Card.Body>
              <Spinner className="state-spinner" />
              <h2 className="state-title">Loading job</h2>
              <p className="state-desc" style={{ marginBottom: 0 }}>
                Please wait while we fetch the job details.
              </p>
            </Card.Body>
          </Card>
        </div>
      </>
    );
  }

  if (getSingleJobStatus === "succeeded") {
    return (
      <>
        <title>CareerHub | Get A Single Job From {singleJob?.company}</title>
        <div className="root">
          <div className="container">
            <Card style={{ width: "100%", maxWidth: "initial" }}>
              <Card.Header>
                <h1 className="card-header-heading">Job Details</h1>
                <p className="card-header--subheading">
                  View complete job information and decide if this opportunity
                  is the right fit for you.
                </p>
              </Card.Header>
              <Card.Body>
                <div className={styles["info-cards"]}>
                  <InfoCard
                    IconComponent={DocumentMagnifyingGlassIcon}
                    desc={singleJob?.jobDescription || "Not available"}
                    title={"Job description"}
                  />
                  <InfoCard
                    IconComponent={IdentificationIcon}
                    desc={singleJob?.jobLocation || "Not available"}
                    title={"Job location"}
                  />
                  <InfoCard
                    IconComponent={ListBulletIcon}
                    desc={singleJob?.jobSkills?.join(" | ") || "Not available"}
                    title={"Required skills"}
                  />
                  <InfoCard
                    IconComponent={WrenchScrewdriverIcon}
                    desc={
                      singleJob?.jobFacilities?.join(" | ") || "Not available"
                    }
                    title={"Job benefits"}
                  />
                  <InfoCard
                    IconComponent={ArrowRightEndOnRectangleIcon}
                    desc={singleJob?.jobStatus || "Not available"}
                    title={"Job status"}
                  />
                  <InfoCard
                    IconComponent={CreditCardIcon}
                    desc={"$" + singleJob?.jobSalary || "Not available"}
                    title={"Job salary"}
                  />
                </div>
              </Card.Body>
              <Card.Footer className={"to-footer"}>
                <p>
                  Get back to the jobs list? <Link to="/jobs">here</Link>
                </p>
              </Card.Footer>
            </Card>
          </div>
        </div>
      </>
    );
  }

  if (getSingleJobStatus === "failed" && getSingleJobError) {
    return (
      <>
        <title>CareerHub | Get A Single Job | Failed State</title>

        <div className="root">
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
        </div>
      </>
    );
  }
};

export default JobDetails;
