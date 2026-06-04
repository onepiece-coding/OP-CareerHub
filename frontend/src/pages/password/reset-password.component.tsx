/**
 * @file src/pages/password/reset-password.component.tsx
 */

import { resetPasswordSchema, type ResetPasswordValues } from "@/validations";
import { selectIsAuthenticated } from "@/store/auth/auth-selectors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Navigate, useParams } from "react-router-dom";
import { Button, Card, Link } from "@/components/ui";
import { FormField } from "@/components/forms";
import {
  selectResetPasswordError,
  selectResetPasswordStatus,
} from "@/store/password/password-selectors";
import { useEffect, useRef } from "react";
import {
  clearResetPasswordState,
  resetPassword,
} from "@/store/password/password-slice";
import { useForm } from "@/hooks";

export const ResetPasswordComponent = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { userId, token } = useParams();

  const successHeadingRef = useRef<HTMLHeadingElement>(null);
  const errorHeadingRef = useRef<HTMLHeadingElement>(null);
  const status = useAppSelector(selectResetPasswordStatus);
  const error = useAppSelector(selectResetPasswordError);
  const dispatch = useAppDispatch();

  const { errors, touched, isSubmitting, register, handleSubmit } =
    useForm<ResetPasswordValues>(resetPasswordSchema, {
      confirmPassword: "",
      password: "",
    });

  const onSubmit = async (data: ResetPasswordValues) => {
    const { password } = data;

    if (!userId || !token) {
      console.error("Missing userId or token in URL");
      return;
    }

    try {
      await dispatch(
        resetPassword({
          authInfo: { userId, token },
          formData: {
            password,
          },
        }),
      ).unwrap();
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Send Reset Password Link Failed:", error);
      }
    }
  };

  useEffect(() => {
    return () => {
      dispatch(clearResetPasswordState());
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
              Password reset
            </h1>
            <p className="card-header--subheading">
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Iste!
            </p>
          </Card.Header>
          <Card.Body>
            <Link to="/auth/login">Sign In</Link>
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
              Reset password failed
            </h1>
            <p className="card-header--subheading">{error}</p>
          </Card.Header>
          <Card.Body>
            <Link to="/password/send-reset-password-link">
              Get your reset password link again
            </Link>
          </Card.Body>
        </Card>
      </div>
    );
  }

  return (
    <div className={`root`}>
      <Card>
        <Card.Header>
          <h1 className="card-header-heading">Reset password</h1>
          <p className="card-header--subheading">
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
          </p>
        </Card.Header>

        <Card.Body>
          <form onSubmit={handleSubmit(onSubmit)} className={"form"} noValidate>
            {/* Password */}
            <FormField
              helperText="At least 8 characters, one uppercase letter, one number."
              placeholder="Min. 8 chars, 1 uppercase, 1 number"
              autoComplete="new-password"
              touched={touched.password}
              {...register("password")}
              error={errors.password}
              label="New Password"
              type="password"
              required
            />

            {/* Confirm Password */}
            <FormField
              touched={touched.confirmPassword}
              placeholder="Repeat your password"
              {...register("confirmPassword")}
              error={errors.confirmPassword}
              autoComplete="new-password"
              label="Confirm Password"
              type="password"
              required
            />

            {/* Submit */}
            <Button
              type="submit"
              disabled={isSubmitting}
              ariaBusy={isSubmitting}
            >
              {isSubmitting ? "Resetting..." : "Reset password"}
            </Button>
          </form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ResetPasswordComponent;
