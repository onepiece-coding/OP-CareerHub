/**
 * @file src/pages/dashboard/recruiter/recruiter-applications/update-app-status-to-be-rejected.component.tsx
 */

import { updateApplicationStatus } from "@/store/applications/applications-slice";
import { addToast } from "@/store/toasts/toasts-slice";
import { useAppDispatch } from "@/store/hooks";
import { APP_STATUS } from "@/lib/types";
import { Button } from "@/components/ui";
import { useState } from "react";

interface UpdateApplicationStatusToBeRejectedProps {
  applicationId: string;
  jobId: string;
}

const UpdateApplicationStatusToBeRejected = ({
  applicationId,
  jobId,
}: UpdateApplicationStatusToBeRejectedProps) => {
  const [loading, setLoading] = useState(false);

  const dispatch = useAppDispatch();

  const handleUpdateApplicationStatusToBeRejected = async () => {
    if (!applicationId || !jobId) return;

    setLoading(true);

    try {
      await dispatch(
        updateApplicationStatus({
          applicationId,
          body: { jobId, status: APP_STATUS.REJECTED },
        }),
      ).unwrap();

      dispatch(
        addToast({
          type: "success",
          message: "Job status updated to be rejected",
        }),
      );
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Update Application Status To Be Rejected:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      aria-label={`Set status to ${APP_STATUS.REJECTED} for this application`}
      onClick={handleUpdateApplicationStatusToBeRejected}
      aria-busy={loading}
      disabled={loading}
      variant="red"
    >
      {loading ? "Rejecting..." : "Reject"}
    </Button>
  );
};

export default UpdateApplicationStatusToBeRejected;
