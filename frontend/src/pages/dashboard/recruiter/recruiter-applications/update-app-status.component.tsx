/**
 * @file src/pages/dashboard/recruiter/recruiter-applications/update-app-status-to-be-accepted.component.tsx
 */

import { updateApplicationStatus } from "@/store/applications/applications-slice";
import { addToast } from "@/store/toasts/toasts-slice";
import { useAppDispatch } from "@/store/hooks";
import { Button } from "@/components/ui";
import { APP_STATUS } from "@/lib/types";
import { useState } from "react";

interface UpdateApplicationStatusProps {
  action: "toBeAccepted" | "toBeRejected";
  applicationId: string;
  jobId: string;
}

const UpdateApplicationStatus = ({
  applicationId,
  action,
  jobId,
}: UpdateApplicationStatusProps) => {
  const [loading, setLoading] = useState(false);

  const dispatch = useAppDispatch();

  const handleUpdateApplicationStatus = async () => {
    if (!applicationId || !jobId) return;

    setLoading(true);

    try {
      await dispatch(
        updateApplicationStatus({
          applicationId,
          body: {
            jobId,
            status:
              action === "toBeAccepted"
                ? APP_STATUS.ACCEPTED
                : APP_STATUS.REJECTED,
          },
        }),
      ).unwrap();

      dispatch(
        addToast({
          type: "success",
          message: "Job status updated to be accepted",
        }),
      );
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Update Application Status To Be Accepted:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  if (action === "toBeRejected") {
    return (
      <Button
        aria-label={`Set status to ${APP_STATUS.REJECTED} for this application`}
        aria-busy={loading}
        disabled={loading}
        onClick={handleUpdateApplicationStatus}
        variant="red"
      >
        {loading ? "Rejecting..." : "Reject"}
      </Button>
    );
  }

  return (
    <Button
      aria-label={`Set status to ${APP_STATUS.ACCEPTED} for this application`}
      aria-busy={loading || loading}
      disabled={loading || loading}
      onClick={handleUpdateApplicationStatus}
      variant="emerald"
    >
      {loading ? "Accepting..." : "Accept"}
    </Button>
  );
};

export default UpdateApplicationStatus;
