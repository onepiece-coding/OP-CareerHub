/**
 * @file src/pages/password/send-reset-password-link.component.tsx
 */

import { selectIsAuthenticated } from "@/store/auth/auth-selectors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Button, Card } from "@/components/ui";
import { FormField } from "@/components/forms";
import {
  selectSendResetPasswordLinkError,
  selectSendResetPasswordLinkStatus,
} from "@/store/password/password-selectors";
import { Navigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import {
  clearSendResetPasswordLinkState,
  sendResetPasswordLink,
} from "@/store/password/password-slice";
import { useForm } from "@/hooks";
import {
  SendResetPasswordLinkSchema,
  type SendResetPasswordLinkValues,
} from "@/validations";

export const SendResetPasswordLinkComponent = () => {
  const status = useAppSelector(selectSendResetPasswordLinkStatus);
  const error = useAppSelector(selectSendResetPasswordLinkError);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const successHeadingRef = useRef<HTMLHeadingElement>(null);
  const errorHeadingRef = useRef<HTMLHeadingElement>(null);
  const dispatch = useAppDispatch();

  const { errors, touched, isSubmitting, register, handleSubmit, reset } =
    useForm<SendResetPasswordLinkValues>(SendResetPasswordLinkSchema, {
      email: "",
    });

  const onSubmit = async (data: SendResetPasswordLinkValues) => {
    const { email } = data;

    try {
      await dispatch(sendResetPasswordLink({ email })).unwrap();
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Send Reset Password Link Failed:", error);
      }
    }
  };

  useEffect(() => {
    return () => {
      dispatch(clearSendResetPasswordLinkState());
    };
  }, [dispatch]);

  // ✅ Shift focus to the new heading when state transitions
  useEffect(() => {
    if (status === "succeeded") successHeadingRef.current?.focus();
  }, [status]);

  useEffect(() => {
    if (status === "failed" && error) errorHeadingRef.current?.focus();
  }, [status, error]);

  if (isAuthenticated) return <Navigate to={"/"} />;

  if (status === "succeeded") {
    return (
      <div className="root">
        <Card>
          <Card.Header>
            <h1
              className="card-header-heading"
              ref={successHeadingRef}
              tabIndex={-1}
            >
              Please check your inbox
            </h1>
            <p className="card-header--subheading">
              Password reset link has been sent to your email
            </p>
          </Card.Header>
          <Card.Body>
            <Button
              onClick={() => {
                dispatch(clearSendResetPasswordLinkState());
                reset();
              }}
            >
              Get your reset password link again
            </Button>
          </Card.Body>
        </Card>
      </div>
    );
  }

  if (status === "failed" && error) {
    return (
      <div className="root">
        <Card>
          <Card.Header>
            <h1
              className="card-header-heading"
              ref={errorHeadingRef}
              tabIndex={-1}
            >
              Send a reset password link failed
            </h1>
            <p className="card-header--subheading">{error}</p>
          </Card.Header>
          <Card.Body>
            <Button
              onClick={() => {
                dispatch(clearSendResetPasswordLinkState());
                reset();
              }}
            >
              Get your reset password link again
            </Button>
          </Card.Body>
        </Card>
      </div>
    );
  }

  return (
    <div className={`root`}>
      <Card>
        <Card.Header>
          <h1 className="card-header-heading">Get a password reset link</h1>
          <p className="card-header--subheading">
            Enter your email to receive a password reset link.
          </p>
        </Card.Header>

        <Card.Body>
          <form onSubmit={handleSubmit(onSubmit)} className={"form"} noValidate>
            {/* Email */}
            <FormField
              placeholder="ada@company.com"
              touched={touched.email}
              {...register("email")}
              error={errors.email}
              autoComplete="email"
              label="Work Email"
              type="email"
              required
            />

            {/* Submit */}
            <Button
              type="submit"
              disabled={isSubmitting}
              ariaBusy={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send a password reset link"}
            </Button>
          </form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default SendResetPasswordLinkComponent;
