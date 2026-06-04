/**
 * @file src/pages/auth/register.component.tsx
 */

import { clearRegisterState, registerUser } from "@/store/auth/auth-slice";
import { registerSchema, type RegisterValues } from "@/validations";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Link, Navigate } from "react-router-dom";
import { FormField } from "@/components/forms";
import { Button, Card } from "@/components/ui";
import { useEffect, useRef } from "react";
import {
  selectIsAuthenticated,
  selectRegisterError,
  selectRegisterStatus,
} from "@/store/auth/auth-selectors";
import { useForm } from "@/hooks";

export const RegisterComponent = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const successHeadingRef = useRef<HTMLHeadingElement>(null);
  const errorHeadingRef = useRef<HTMLHeadingElement>(null);

  const status = useAppSelector(selectRegisterStatus);
  const error = useAppSelector(selectRegisterError);

  const dispatch = useAppDispatch();

  const {
    values,
    errors,
    touched,
    isSubmitting,
    register,
    handleSubmit,
    reset,
  } = useForm<RegisterValues>(registerSchema, {
    confirmPassword: "",
    username: "",
    password: "",
    email: "",
  });

  const onSubmit = async (data: RegisterValues) => {
    const { username, email, password } = data;

    try {
      await dispatch(registerUser({ username, email, password })).unwrap();
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Registration failed:", error);
      }
    }
  };

  useEffect(() => {
    return () => {
      dispatch(clearRegisterState());
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
      <div className={"root"}>
        <Card>
          <Card.Header>
            {/* tabIndex={-1} makes it programmatically focusable without keyboard tab stop */}
            <h1
              className="card-header-heading"
              ref={successHeadingRef}
              tabIndex={-1}
            >
              You're in.
            </h1>
            <p className="card-header--subheading">
              Welcome to CareerHub, {values.username}. Your account has been
              created — check your inbox for a verification email.
            </p>
          </Card.Header>
          <Card.Body>
            <Button
              onClick={() => {
                dispatch(clearRegisterState());
                reset();
              }}
            >
              Register another account
            </Button>
          </Card.Body>
        </Card>
      </div>
    );
  }

  if (status === "failed" && error) {
    return (
      <div className={"root"}>
        <Card>
          <Card.Header>
            <h1
              className="card-header-heading"
              ref={errorHeadingRef}
              tabIndex={-1}
            >
              Registration Failed
            </h1>
            <p className="card-header--subheading">{error}</p>
          </Card.Header>
          <Card.Body>
            <Button
              onClick={() => {
                dispatch(clearRegisterState());
                reset();
              }}
            >
              Register your account again
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
          <h1 className="card-header-heading">Create your account</h1>
          <p className="card-header--subheading">
            Join thousands of professionals finding their next opportunity.
          </p>
        </Card.Header>

        <Card.Body>
          <form onSubmit={handleSubmit(onSubmit)} className={"form"} noValidate>
            {/* Username */}
            <FormField
              touched={touched.username}
              {...register("username")}
              autoComplete="username"
              error={errors.username}
              label="Username"
              placeholder="Ada"
              type="text"
              required
            />

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

            {/* Password */}
            <FormField
              helperText="At least 8 characters, one uppercase letter, one number."
              placeholder="Min. 8 chars, 1 uppercase, 1 number"
              autoComplete="new-password"
              touched={touched.password}
              {...register("password")}
              error={errors.password}
              label="Password"
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
              {isSubmitting ? "Creating account…" : "Create account"}
            </Button>
          </form>
        </Card.Body>

        <Card.Footer className={"to-footer"}>
          <p>
            Already have an account? <Link to="/auth/login">Sign in</Link>
          </p>
        </Card.Footer>
      </Card>
    </div>
  );
};

export default RegisterComponent;
