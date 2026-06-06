/**
 * @file src/pages/auth/login.component.tsx
 */

import { clearLoginState, loginUser } from "@/store/auth/auth-slice";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loginSchema, type LoginValues } from "@/validations";
import { addToast } from "@/store/toasts/toasts-slice";
import { FormField } from "@/components/forms";
import { Button, Card } from "@/components/ui";
import { useEffect, useRef } from "react";
import {
  selectIsAuthenticated,
  selectLoginError,
  selectLoginStatus,
} from "@/store/auth/auth-selectors";
import { useForm } from "@/hooks";

import styles from "./styles.module.css";

export const LoginComponent = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const errorHeadingRef = useRef<HTMLHeadingElement>(null);
  const status = useAppSelector(selectLoginStatus);
  const error = useAppSelector(selectLoginError);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { errors, touched, isSubmitting, register, handleSubmit, reset } =
    useForm<LoginValues>(loginSchema, {
      password: "",
      email: "",
    });

  const onSubmit = (data: LoginValues) => {
    const { email, password } = data;

    dispatch(loginUser({ email, password }))
      .unwrap()
      .then((response) => {
        if (response.unreadNotificationsCount > 0) {
          dispatch(
            addToast({
              type: "primary",
              message: `You have ${response.unreadNotificationsCount} unread notifications!`,
            }),
          );
        } else {
          dispatch(
            addToast({
              type: "success",
              message: "Successful login to your account",
            }),
          );
        }
        reset();
        navigate("/", { replace: true });
      })
      .catch((error) => {
        if (import.meta.env.MODE === "development") {
          console.error("Login failed:", error);
        }
      });
  };

  useEffect(() => {
    return () => {
      dispatch(clearLoginState());
    };
  }, [dispatch]);

  // ✅ Shift focus to the new heading when state transitions
  useEffect(() => {
    if (status === "failed" && error) errorHeadingRef.current?.focus();
  }, [status, error]);

  if (isAuthenticated) return <Navigate to={"/"} />;

  if (status === "failed" && error) {
    return (
      <div className={`root`}>
        <Card>
          <Card.Header>
            <h1
              className="card-header-heading"
              ref={errorHeadingRef}
              tabIndex={-1}
            >
              Login Failed
            </h1>
            <p className="card-header--subheading">{error}</p>
          </Card.Header>
          <Card.Body>
            <Button
              onClick={() => {
                dispatch(clearLoginState());
                reset();
              }}
            >
              Login to your account again
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
          <h1 className="card-header-heading">Welcome back</h1>
          <p className="card-header--subheading">
            Sign in to your CareerHub account.
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

            {/* Password */}
            <FormField
              autoComplete="current-password"
              touched={touched.password}
              {...register("password")}
              error={errors.password}
              label="Password"
              type="password"
              required
            />

            {/* Submit */}
            <Button
              type="submit"
              disabled={isSubmitting}
              ariaBusy={isSubmitting}
            >
              {isSubmitting ? "Logging…" : "Sign in"}
            </Button>
          </form>
        </Card.Body>

        <Card.Footer className={`${styles["card-footer"]} to-footer`}>
          <p>
            No account yet? <Link to="/auth/register">Create one</Link>
          </p>
          <Link to="/password/send-reset-password-link">Reset password</Link>
        </Card.Footer>
      </Card>
    </div>
  );
};

export default LoginComponent;
