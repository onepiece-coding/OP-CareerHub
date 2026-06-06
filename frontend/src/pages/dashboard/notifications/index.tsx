/**
 * @file src/pages/dashboard/notifications/index.tsx
 */

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { EyeIcon } from "@/components/icons";
import {
  selectDeleteNotificationError,
  selectDeleteNotificationStatus,
  selectGetNotificationsError,
  selectGetNotificationsStatus,
  selectMarkNotificationAsReadError,
  selectMarkNotificationAsReadStatus,
  selectRecords,
} from "@/store/notifications/notifications-selectors";
import {
  clearDeleteNotificationState,
  clearGetNotificationsState,
  clearMarkNotificationAsReadState,
  getNotifications,
} from "@/store/notifications/notifications-slice";
import type { Notification } from "@/lib/types";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Badge,
  Button,
  Card,
  Spinner,
  Table,
  type Column,
} from "@/components/ui";
import { formatTimeAgo } from "@/lib/utils";
import MarkNotificationAsRead from "./mark-notification-as-read.component";
import DeleteNotification from "./delete-notification.component";
import { selectIsRecruiter } from "@/store/auth/auth-selectors";

const Notifications = () => {
  const deleteNotificationErrorHeadingRef = useRef<HTMLHeadingElement>(null);
  const getNotificationsErrorHeadingRef = useRef<HTMLHeadingElement>(null);
  const markNotificationAsReadErrorHeadingRef =
    useRef<HTMLHeadingElement>(null);

  const [retry, setRetry] = useState(0);

  const deleteNotificationError = useAppSelector(selectDeleteNotificationError);
  const getNotificationsStatus = useAppSelector(selectGetNotificationsStatus);
  const getNotificationsError = useAppSelector(selectGetNotificationsError);
  const isRecruiter = useAppSelector(selectIsRecruiter);
  const notifications = useAppSelector(selectRecords);
  const markNotificationAsReadError = useAppSelector(
    selectMarkNotificationAsReadError,
  );
  const markNotificationAsReadStatus = useAppSelector(
    selectMarkNotificationAsReadStatus,
  );
  const deleteNotificationStatus = useAppSelector(
    selectDeleteNotificationStatus,
  );

  const dispatch = useAppDispatch();

  const columns: Column<Notification>[] = [
    {
      key: "#",
      header: "#",
      render: (_, __, rowIndex) => {
        if (rowIndex + 1 < 10) return `0${rowIndex + 1}`;
        return rowIndex + 1;
      },
    },
    {
      key: "type",
      header: "Type",
    },
    {
      header: "Message",
      key: "message",
    },
    {
      header: "Created",
      key: "createdAt",
      render: (value) => {
        return formatTimeAgo(value);
      },
    },
    {
      header: "Actions",
      key: "actions",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "12px" }}>
          <>
            <Link
              to={`/dashboard/${isRecruiter ? "recruiter" : "user"}-applications?relatedId=${record.relatedId}`}
            >
              <Badge variant="yellow">
                <EyeIcon />
              </Badge>
            </Link>
            {!record.read && (
              <MarkNotificationAsRead notificationId={record._id} />
            )}
            <DeleteNotification notificationId={record._id} />
          </>
        </div>
      ),
    },
  ];

  useEffect(() => {
    const promise = dispatch(getNotifications());

    return () => {
      promise?.abort();
      dispatch(clearMarkNotificationAsReadState());
      dispatch(clearDeleteNotificationState());
      dispatch(clearGetNotificationsState());
    };
  }, [dispatch, retry]);

  // ✅ Shift focus to the new heading when state transitions
  useEffect(() => {
    if (getNotificationsStatus === "failed" && getNotificationsError)
      getNotificationsErrorHeadingRef.current?.focus();
  }, [getNotificationsStatus, getNotificationsError]);

  // ✅ Shift focus to the new heading when state transitions
  useEffect(() => {
    if (
      markNotificationAsReadStatus === "failed" &&
      markNotificationAsReadError
    )
      markNotificationAsReadErrorHeadingRef.current?.focus();
  }, [markNotificationAsReadStatus, markNotificationAsReadError]);

  // ✅ Shift focus to the new heading when state transitions
  useEffect(() => {
    if (deleteNotificationStatus === "failed" && deleteNotificationError)
      deleteNotificationErrorHeadingRef.current?.focus();
  }, [deleteNotificationStatus, deleteNotificationError]);

  if (
    markNotificationAsReadStatus === "failed" &&
    markNotificationAsReadError
  ) {
    return (
      <>
        <title>CareerHub | Mark Notification As Read | Failed State</title>
        <Card>
          <Card.Header>
            <h1
              ref={markNotificationAsReadErrorHeadingRef}
              className="card-header-heading"
              tabIndex={-1}
            >
              Mark notification as read failed
            </h1>
            <p className="card-header--subheading">
              {markNotificationAsReadError}
            </p>
          </Card.Header>
          <Card.Body>
            <Button
              onClick={() => {
                dispatch(clearMarkNotificationAsReadState());
              }}
            >
              Try Again
            </Button>
          </Card.Body>
        </Card>
      </>
    );
  }

  if (deleteNotificationStatus === "failed" && deleteNotificationError) {
    return (
      <>
        <title>CareerHub | Delete Notification | Failed State</title>
        <Card>
          <Card.Header>
            <h1
              ref={deleteNotificationErrorHeadingRef}
              className="card-header-heading"
              tabIndex={-1}
            >
              Delete notification failed
            </h1>
            <p className="card-header--subheading">{deleteNotificationError}</p>
          </Card.Header>
          <Card.Body>
            <Button
              onClick={() => {
                dispatch(clearDeleteNotificationState());
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
    getNotificationsStatus === "idle" ||
    getNotificationsStatus === "pending"
  ) {
    return (
      <>
        <title>CareerHub | Get Notifications | Loading State</title>

        <Card className={`state`}>
          <Card.Body>
            <Spinner className={"state-spinner"} />
            <h2 className={"state-title"}>Get Notifications</h2>
            <p className={"state-desc"} style={{ marginBottom: 0 }}>
              Please wait while we get your notifications.
            </p>
          </Card.Body>
        </Card>
      </>
    );
  }

  if (getNotificationsStatus === "succeeded") {
    return (
      <>
        <title>CareerHub | All The User Notifications</title>

        <div className="container">
          <Card style={{ width: "100%", maxWidth: "initial" }}>
            <Card.Header>
              <h1 className="card-header-heading">
                All the user notifications
              </h1>
              <p className="card-header--subheading">
                Stay updated with the latest alerts, and activity.
              </p>
            </Card.Header>
            <Card.Body>
              <Table columns={columns} data={notifications} rowKey="_id" />
            </Card.Body>
            <Card.Footer className={"to-footer"}>
              <p>
                Get back to your applications list?{" "}
                <Link to="/dashboard/recruiter-applications">here</Link>
              </p>
            </Card.Footer>
          </Card>
        </div>
      </>
    );
  }

  if (getNotificationsStatus === "failed" && getNotificationsError) {
    return (
      <>
        <title>CareerHub | Get Notifications | Failed State</title>

        <Card>
          <Card.Header>
            <h1
              ref={getNotificationsErrorHeadingRef}
              className="card-header-heading"
              tabIndex={-1}
            >
              get the user notifications failed
            </h1>
            <p className="card-header--subheading">{getNotificationsError}</p>
          </Card.Header>
          <Card.Body>
            <Button
              onClick={() => {
                dispatch(clearGetNotificationsState());
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

export default Notifications;
