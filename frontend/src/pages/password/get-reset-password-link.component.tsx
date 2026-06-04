/**
 * @file src/pages/password/get-reset-password-link.component.tsx
 */

import { selectIsAuthenticated } from "@/store/auth/auth-selectors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Navigate, useParams } from "react-router-dom";
import { Card, Link, Spinner } from "@/components/ui";
import {
  selectGetResetPasswordLinkError,
  selectGetResetPasswordLinkStatus,
} from "@/store/password/password-selectors";
import { useEffect, useRef } from "react";
import {
  clearGetResetPasswordLinkState,
  getResetPasswordLink,
} from "@/store/password/password-slice";

const GetResetPasswordLinkComponent = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { userId, token } = useParams();

  const succeededHeadingRef = useRef<HTMLHeadingElement>(null);
  const failedHeadingRef = useRef<HTMLHeadingElement>(null);

  const status = useAppSelector(selectGetResetPasswordLinkStatus);
  const error = useAppSelector(selectGetResetPasswordLinkError);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!userId || !token) {
      console.error("Missing userId or token in URL");
      return;
    }

    const promise = dispatch(getResetPasswordLink({ userId, token }));

    return () => {
      dispatch(clearGetResetPasswordLinkState());
      promise.abort();
    };
  }, [userId, token, dispatch]);

  // ✅ Focus management on transition — consistent with other pages
  useEffect(() => {
    if (status === "succeeded") succeededHeadingRef.current?.focus();
  }, [status]);

  useEffect(() => {
    if (status === "failed") failedHeadingRef.current?.focus();
  }, [status, error]);

  if (isAuthenticated) return <Navigate to={"/"} />;

  if (status === "idle" || status === "pending") {
    <div className={`root`}>
      <Card className={`state`}>
        <Card.Body>
          <Spinner className={"state-spinner"} />
          <h2 className={"state-title"}>Verifying URL</h2>
          <p className={"state-desc"} style={{ marginBottom: 0 }}>
            Please wait while we verify the URL.
          </p>
        </Card.Body>
      </Card>
    </div>;
  }

  if (status === "succeeded") {
    return (
      <div className="root">
        <Card className={"state"}>
          <Card.Body>
            <div className="icon-circle success-icon" aria-hidden="true">
              ✓
            </div>
            <h2
              className={"state-title"}
              ref={succeededHeadingRef}
              tabIndex={-1}
            >
              Valid URL!
            </h2>
            <p className={"state-desc"}>
              Lorem ipsum dolor sit amet consectetur, adipisicing elit.
            </p>
            <Link to={`/password/reset-password/${userId}/${token}`}>
              Reset Password
            </Link>
          </Card.Body>
        </Card>
      </div>
    );
  }

  if (status === "failed" && error) {
    return (
      <div className={`root`}>
        <Card className={"state"}>
          <Card.Body>
            <div className={"icon-circle failed-icon"} aria-hidden="true">
              ⚠️
            </div>
            <h2 className={`state-title`} ref={failedHeadingRef} tabIndex={-1}>
              Invalid link!
            </h2>
            <p className={`state-desc`}>
              The link may have expired or is invalid. Request a new one below.
            </p>
            <Link to="/password/send-reset-password-link">Resend Link</Link>
          </Card.Body>
        </Card>
      </div>
    );
  }
};

export default GetResetPasswordLinkComponent;
