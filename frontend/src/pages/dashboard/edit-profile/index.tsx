/**
 * @file src/pages/dashboard/edit-profile/index.tsx
 */

import { selectCurrentUser } from "@/store/auth/auth-selectors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToast } from "@/store/toasts/toasts-slice";
import { Link, useNavigate } from "react-router-dom";
import { Button, Card } from "@/components/ui";
import { FormField } from "@/components/forms";
import { useEffect, useRef } from "react";
import {
  selectUpdateUserProfileError,
  selectUpdateUserProfileStatus,
} from "@/store/users/users-selectors";
import {
  clearUpdateUserProfileState,
  updateUserProfile,
} from "@/store/users/users-slice";
import { useForm } from "@/hooks";
import {
  updateUserProfileSchema,
  type UpdateUserProfileValues,
} from "@/validations";

const GENDER_OPTIONS = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
];

const EditProfile = () => {
  const errorHeadingRef = useRef<HTMLHeadingElement>(null);

  const updateUserProfileStatus = useAppSelector(selectUpdateUserProfileStatus);
  const updateUserProfileError = useAppSelector(selectUpdateUserProfileError);
  const currentUser = useAppSelector(selectCurrentUser);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    errors,
    touched,
    isSubmitting,
    register,
    registerSelect,
    handleSubmit,
    reset,
  } = useForm<UpdateUserProfileValues>(updateUserProfileSchema, {
    username: currentUser?.username || "",
    location: currentUser?.location || "",
    gender: currentUser?.gender || "",
  });

  const onSubmit = async (data: UpdateUserProfileValues) => {
    if (!currentUser) return;

    const body: Partial<UpdateUserProfileValues> = {};

    if (data.username) body.username = data.username;
    if (data.location) body.location = data.location;
    if (data.gender) body.gender = data.gender;

    try {
      await dispatch(
        updateUserProfile({ userId: currentUser?._id, data: body }),
      ).unwrap();

      dispatch(
        addToast({
          type: "success",
          message: "Successful update your profile",
        }),
      );

      reset();
      navigate(`/dashboard`, { replace: true });
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Update user profile failed:", error);
      }
    }
  };

  useEffect(() => {
    return () => {
      dispatch(clearUpdateUserProfileState());
    };
  }, [dispatch]);

  // ✅ Shift focus to the new heading when state transitions
  useEffect(() => {
    if (updateUserProfileStatus === "failed" && updateUserProfileError)
      errorHeadingRef.current?.focus();
  }, [updateUserProfileStatus, updateUserProfileError]);

  if (updateUserProfileStatus === "failed" && updateUserProfileError) {
    return (
      <>
        <title>CareerHub | Edit Profile | Update User Profile Failed</title>

        <Card>
          <Card.Header>
            <h1
              className="card-header-heading"
              ref={errorHeadingRef}
              tabIndex={-1}
            >
              Update user profile failed
            </h1>
            <p className="card-header--subheading">{updateUserProfileError}</p>
          </Card.Header>

          <Card.Body>
            <Button
              onClick={() => {
                dispatch(clearUpdateUserProfileState());
                reset();
              }}
            >
              Try to update your profile again
            </Button>
          </Card.Body>
        </Card>
      </>
    );
  }

  return (
    <>
      <title>CareerHub | Edit Profile</title>
      <Card>
        <Card.Header>
          <h1 className="card-header-heading">Edit profile</h1>
          <p className="card-header--subheading">
            Update your CareerHub account info.
          </p>
        </Card.Header>
        <Card.Body>
          <form onSubmit={handleSubmit(onSubmit)} className={"form"} noValidate>
            {/* Username */}
            <FormField
              touched={touched.username}
              {...register("username")}
              error={errors.username}
              autoComplete="username"
              label="Username"
              type="text"
              required
            />

            {/* Location */}
            <FormField
              autoComplete="street-address"
              touched={touched.location}
              {...register("location")}
              error={errors.location}
              label="Location"
              type="text"
              required
            />

            {/* Gender */}
            <FormField
              placeholder="Select a gender..."
              {...registerSelect("gender")}
              options={GENDER_OPTIONS}
              touched={touched.gender}
              error={errors.gender}
              label="Your Gender"
              type="select"
              required
            />

            {/* Submit */}
            <Button
              ariaBusy={isSubmitting}
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Updating..." : "Update"}
            </Button>
          </form>
        </Card.Body>
        <Card.Footer className={"to-footer"}>
          <p>
            Get back to your profile? <Link to="/dashboard">here</Link>
          </p>
        </Card.Footer>
      </Card>
    </>
  );
};

export default EditProfile;
