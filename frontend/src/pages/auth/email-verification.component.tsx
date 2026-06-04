/**
 * @file src/pages/auth/email-verification.component.tsx
 */

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Navigate, useParams } from "react-router-dom";
import { Card, Link, Spinner } from "@/components/ui";
import { useEffect, useRef } from "react";
import {
  selectEmailVerificationError,
  selectEmailVerificationStatus,
  selectIsAuthenticated,
} from "@/store/auth/auth-selectors";
import {
  clearEmailVerificationState,
  emailVerification,
} from "@/store/auth/auth-slice";

const EmailVerification = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { userId, token } = useParams();

  const succeededHeadingRef = useRef<HTMLHeadingElement>(null);
  const failedHeadingRef = useRef<HTMLHeadingElement>(null);

  const status = useAppSelector(selectEmailVerificationStatus);
  const error = useAppSelector(selectEmailVerificationError);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!userId || !token) {
      console.error("Missing userId or token in URL");
      return;
    }

    const promise = dispatch(emailVerification({ userId, token }));

    return () => {
      dispatch(clearEmailVerificationState());
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
    return (
      <div className={`root`}>
        <Card className={`state`}>
          <Card.Body>
            <Spinner className={"state-spinner"} />
            <h2 className={"state-title"}>Verifying your email</h2>
            <p className={"state-desc"} style={{ marginBottom: 0 }}>
              Please wait while we confirm your account.
            </p>
          </Card.Body>
        </Card>
      </div>
    );
  }

  if (status === "succeeded") {
    return (
      <div className={`root`}>
        <Card className={`state`}>
          <Card.Body>
            <div className={`icon-circle success-icon`} aria-hidden="true">
              ✓
            </div>
            <h2
              className={"state-title"}
              ref={succeededHeadingRef}
              tabIndex={-1}
            >
              Email Verified!
            </h2>
            <p className={`state-desc`}>
              Your account is now active. You can close this window or log in.
            </p>
            <Link to="/auth/login">Log In</Link>
          </Card.Body>
        </Card>
      </div>
    );
  }

  if (status === "failed" && error) {
    return (
      <div className={`root`}>
        <Card className={`state`}>
          <Card.Body>
            <div className={`icon-circle failed-icon`} aria-hidden="true">
              ⚠️
            </div>
            <h2 className={`state-title`} ref={failedHeadingRef} tabIndex={-1}>
              Verification Failed
            </h2>
            <p className={`state-desc`}>
              The link may have expired or is invalid. Request a new one below.
            </p>
            <Link to="/auth/login">Resend Link</Link>
          </Card.Body>
        </Card>
      </div>
    );
  }
};

export default EmailVerification;
