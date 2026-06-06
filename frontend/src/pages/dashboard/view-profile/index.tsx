/**
 * @file src/pages/dashboard/view-profile/index.tsx
 */

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { selectCurrentUser, selectIsUser } from "@/store/auth/auth-selectors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Badge, Button, Card, Link } from "@/components/ui";
import { addToast } from "@/store/toasts/toasts-slice";
import { InfoCard } from "@/components/common";
import { formatTimeAgo } from "@/lib/utils";
import {
  selectResumeUploadError,
  selectResumeUploadStatus,
  selectUpdateProfilePhotoError,
  selectUpdateProfilePhotoStatus,
} from "@/store/users/users-selectors";
import {
  clearResumeUploadState,
  clearUpdateProfilePhotoState,
  resumeUpload,
  updateProfilePhoto,
} from "@/store/users/users-slice";
import {
  ClockIcon,
  EnvelopeIcon,
  MapPinIcon,
  UserCircleIcon,
  UserIcon,
  UserPlusIcon,
} from "@/components/icons";

import styles from "./styles.module.css";

const ViewProfile = () => {
  const updateProfilePhotoErrorHeadingRef = useRef<HTMLHeadingElement>(null);
  const ResumeUploadErrorHeadingRef = useRef<HTMLHeadingElement>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [resume, setResume] = useState<File | null>(null);
  const [image, setImage] = useState<File | null>(null);

  const updateProfilePhotoError = useAppSelector(selectUpdateProfilePhotoError);
  const resumeUploadStatus = useAppSelector(selectResumeUploadStatus);
  const resumeUploadError = useAppSelector(selectResumeUploadError);
  const user = useAppSelector(selectCurrentUser);
  const isUser = useAppSelector(selectIsUser);
  const updateProfilePhotoStatus = useAppSelector(
    selectUpdateProfilePhotoStatus,
  );

  const dispatch = useAppDispatch();

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (resume) setResume(null);

    // ✅ Revoke previous URL before creating a new one
    if (preview) URL.revokeObjectURL(preview);

    setImage(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleResumeUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (preview) URL.revokeObjectURL(preview);

    setPreview(null);
    setImage(null);

    setResume(selectedFile);
  };

  const cancelImageUpload = () => {
    // ✅ Revoke before clearing state
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setImage(null);
  };

  const cancelResumeUpload = () => {
    setResume(null);
  };

  const saveImage = async () => {
    if (!image) return;

    const formData = new FormData();
    formData.append("image", image);

    try {
      await dispatch(updateProfilePhoto(formData)).unwrap();

      dispatch(
        addToast({
          type: "success",
          message: "your profile photo uploaded successfully",
        }),
      );

      // ✅ Revoke after successful upload
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
      setImage(null);
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Update profile photo failed:", error);
      }
    }
  };

  const saveResume = async () => {
    if (!resume) return;

    const formData = new FormData();
    formData.append("pdf", resume);

    try {
      await dispatch(resumeUpload(formData)).unwrap();

      dispatch(
        addToast({
          type: "success",
          message: "your resume uploaded successfully",
        }),
      );

      setResume(null);
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Resume Upload failed:", error);
      }
    }
  };

  // ✅ Shift focus to the new heading when state transitions
  useEffect(() => {
    if (updateProfilePhotoStatus === "failed" && updateProfilePhotoError)
      updateProfilePhotoErrorHeadingRef.current?.focus();
  }, [updateProfilePhotoStatus, updateProfilePhotoError]);

  // ✅ Shift focus to the new heading when state transitions
  useEffect(() => {
    if (resumeUploadStatus === "failed" && resumeUploadError)
      ResumeUploadErrorHeadingRef.current?.focus();
  }, [resumeUploadStatus, resumeUploadError]);

  if (updateProfilePhotoStatus === "failed" && updateProfilePhotoError) {
    return (
      <>
        <title>CareerHub | View Profile | Update Profile Photo Failed</title>
        <Card>
          <Card.Header>
            <h1
              className="card-header-heading"
              ref={updateProfilePhotoErrorHeadingRef}
              tabIndex={-1}
            >
              Update Profile Photo Failed
            </h1>
            <p className="card-header--subheading">{updateProfilePhotoError}</p>
          </Card.Header>
          <Card.Body>
            <Button
              onClick={() => {
                dispatch(clearUpdateProfilePhotoState());
              }}
            >
              Try Again
            </Button>
          </Card.Body>
        </Card>
      </>
    );
  }

  if (resumeUploadStatus === "failed" && resumeUploadError) {
    return (
      <>
        <title>CareerHub | Resume Upload Failed</title>
        <Card>
          <Card.Header>
            <h1
              className="card-header-heading"
              ref={ResumeUploadErrorHeadingRef}
              tabIndex={-1}
            >
              Resume upload failed
            </h1>
            <p className="card-header--subheading">{resumeUploadError}</p>
          </Card.Header>
          <Card.Body>
            <Button
              onClick={() => {
                dispatch(clearResumeUploadState());
              }}
            >
              Try Again
            </Button>
          </Card.Body>
        </Card>
      </>
    );
  }

  return (
    <>
      <title>CareerHub | View Profile</title>

      <div className="container">
        <Card style={{ maxWidth: "initial", width: "100%" }}>
          <Card.Header>
            <h1 className="card-header-heading">View Profile</h1>
            <p className="card-header--subheading">
              Review your personal details.
            </p>
          </Card.Header>
          <Card.Body>
            <div className={styles["profile-container"]}>
              <div>
                <div className={styles["profile-picture"]}>
                  {!image ? (
                    <>
                      <label htmlFor="profile-photo">
                        <Badge>change</Badge>
                      </label>
                      <input
                        onChange={handleImageChange}
                        id="profile-photo"
                        accept="image/*"
                        type="file"
                      />
                    </>
                  ) : (
                    <>
                      <Button variant="slate" onClick={cancelImageUpload}>
                        Cancel
                      </Button>
                    </>
                  )}
                  <img
                    src={preview ?? user?.profilePhoto.url}
                    alt={user?.username}
                  />
                </div>

                {isUser && (
                  <div className={styles["resume-upload"]}>
                    {resume ? (
                      <Button
                        variant="slate"
                        onClick={cancelResumeUpload}
                        style={{ width: "100%" }}
                      >
                        Cancel
                      </Button>
                    ) : (
                      <>
                        <label htmlFor="resume-upload">
                          <Badge variant="blue" style={{ width: "100%" }}>
                            Resume upload
                          </Badge>
                        </label>
                        <input
                          onChange={handleResumeUpload}
                          accept="application/pdf"
                          id="resume-upload"
                          type="file"
                        />
                      </>
                    )}
                  </div>
                )}

                {image ? (
                  <Button
                    style={{ width: "100%" }}
                    ariaBusy={updateProfilePhotoStatus === "pending"}
                    disabled={updateProfilePhotoStatus === "pending"}
                    onClick={saveImage}
                    variant="blue"
                  >
                    {updateProfilePhotoStatus === "pending"
                      ? "Saving..."
                      : "Save"}
                  </Button>
                ) : resume ? (
                  <Button
                    style={{ width: "100%", textAlign: "center" }}
                    ariaBusy={resumeUploadStatus === "pending"}
                    disabled={resumeUploadStatus === "pending"}
                    onClick={saveResume}
                    variant="blue"
                  >
                    {resumeUploadStatus === "pending"
                      ? "Uploading..."
                      : "Upload"}
                  </Button>
                ) : (
                  <Link
                    style={{
                      width: "100%",
                      display: "block",
                      textAlign: "center",
                    }}
                    to={`edit-profile/${user?._id}`}
                  >
                    Edit profile
                  </Link>
                )}
              </div>
              <div className={styles["info-cards"]}>
                <InfoCard
                  IconComponent={UserCircleIcon}
                  desc={user?.username || "Not available"}
                  title={"Username"}
                />

                <InfoCard
                  IconComponent={UserPlusIcon}
                  desc={user?.role || "Not available"}
                  title={"User Role"}
                />

                <InfoCard
                  IconComponent={EnvelopeIcon}
                  desc={user?.email || "Not available"}
                  title={"User Email"}
                />

                <InfoCard
                  IconComponent={ClockIcon}
                  desc={user?.createdAt ? formatTimeAgo(user.createdAt) : "—"}
                  title={"Joined Us"}
                />

                <InfoCard
                  IconComponent={MapPinIcon}
                  desc={user?.location || "Not available"}
                  title={"User Location"}
                />

                <InfoCard
                  IconComponent={UserIcon}
                  desc={user?.gender || "Not available"}
                  title={"User Gender"}
                />
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>
    </>
  );
};

export default ViewProfile;
