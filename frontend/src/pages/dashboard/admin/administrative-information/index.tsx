/**
 * @file src/pages/dashboard/admin/administrative-information/index.tsx
 */

import { clearGetAllInfoState, getAllInfo } from "@/store/admin/admin-slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Button, Card, Spinner } from "@/components/ui";
import { InfoCard } from "@/components/common";
import { useEffect, useRef, useState } from "react";
import {
  selectAllInfo,
  selectGetAllInfoError,
  selectGetAllInfoStatus,
} from "@/store/admin/admin-selectors";
import {
  ArrowTrendingUpIcon,
  ArchiveBoxXMarkIcon,
  CurrencyDollarIcon,
  ArchiveBoxIcon,
  ArrowPathIcon,
  BriefcaseIcon,
  UsersIcon,
  PlusIcon,
  type IconProps,
} from "@/components/icons";

import styles from "./styles.module.css";

const getInfoIcon = (key: string): React.ComponentType<IconProps> | null => {
  switch (key) {
    case "rejected":
      return ArchiveBoxXMarkIcon;
    case "jobs":
      return ArrowTrendingUpIcon;
    case "applicants":
      return CurrencyDollarIcon;
    case "pending":
      return ArchiveBoxIcon;
    case "interviews":
      return ArrowPathIcon;
    case "admins":
      return BriefcaseIcon;
    case "users":
      return UsersIcon;
    case "recruiters":
      return PlusIcon;
    default:
      return null;
  }
};

const AdministrativeInformation = () => {
  const errorHeadingRef = useRef<HTMLHeadingElement>(null);

  const [retry, setRetry] = useState(0);

  const status = useAppSelector(selectGetAllInfoStatus);
  const error = useAppSelector(selectGetAllInfoError);
  const info = useAppSelector(selectAllInfo);

  const dispatch = useAppDispatch();

  useEffect(() => {
    const promise = dispatch(getAllInfo());
    return () => {
      promise.abort();
      dispatch(clearGetAllInfoState());
    };
  }, [dispatch, retry]);

  // ✅ Shift focus to the new heading when state transitions
  useEffect(() => {
    if (status === "failed" && error) errorHeadingRef.current?.focus();
  }, [status, error]);

  if (status === "idle" || status === "pending") {
    return (
      <>
        <title>CareerHub | Administrative Information | Loading State</title>
        <Card className={`state`}>
          <Card.Body>
            <Spinner className={"state-spinner"} />
            <h2 className={"state-title"}>Getting all info</h2>
            <p className={"state-desc"} style={{ marginBottom: 0 }}>
              Please wait while we get all info.
            </p>
          </Card.Body>
        </Card>
      </>
    );
  }

  if (status === "succeeded") {
    return (
      <>
        <title>CareerHub | Administrative Information</title>

        <div className="container">
          <Card style={{ width: "100%", maxWidth: "initial" }}>
            <Card.Header>
              <h1 className="card-header-heading">
                Administrative Information
              </h1>
              <p className="card-header--subheading">
                The goal is to turn data into information, and information into
                insight.
              </p>
            </Card.Header>
            <Card.Body>
              <div className={styles["info-cards"]}>
                {Object.entries(info!).map(([key, value]) => (
                  <InfoCard
                    IconComponent={getInfoIcon(key)!}
                    desc={value}
                    title={key}
                    key={key}
                  />
                ))}
              </div>
            </Card.Body>
          </Card>
        </div>
      </>
    );
  }

  if (status === "failed" && error) {
    return (
      <>
        <title>CareerHub | Administrative Information | Error State</title>
        <Card>
          <Card.Header>
            <h1
              className="card-header-heading"
              ref={errorHeadingRef}
              tabIndex={-1}
            >
              Get all info failed
            </h1>
            <p className="card-header--subheading">{error}</p>
          </Card.Header>
          <Card.Body>
            <Button
              onClick={() => {
                dispatch(clearGetAllInfoState());
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

export default AdministrativeInformation;
