/**
 * @file src/pages/dashboard/recruiter/recruiter-applications/update-app-status-to-be-accepted.component.tsx
 */

import { updateApplicationStatus } from "@/store/applications/applications-slice";
import { addToast } from "@/store/toasts/toasts-slice";
import { useAppDispatch } from "@/store/hooks";
import { Button } from "@/components/ui";
import { APP_STATUS } from "@/lib/types";
import { useState } from "react";

interface UpdateApplicationStatusToBeAcceptedProps {
  applicationId: string;
  jobId: string;
}

const UpdateApplicationStatusToBeAccepted = ({
  applicationId,
  jobId,
}: UpdateApplicationStatusToBeAcceptedProps) => {
  const [loading, setLoading] = useState(false);

  const dispatch = useAppDispatch();

  const handleUpdateApplicationStatusToBeAccepted = async () => {
    if (!applicationId || !jobId) return;

    setLoading(true);

    try {
      await dispatch(
        updateApplicationStatus({
          applicationId,
          body: { jobId, status: APP_STATUS.ACCEPTED },
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

  return (
    <Button
      aria-label={`Set status to ${APP_STATUS.ACCEPTED} for this application`}
      onClick={handleUpdateApplicationStatusToBeAccepted}
      aria-busy={loading}
      disabled={loading}
      variant="emerald"
    >
      {loading ? "Accepting..." : "Accept"}
    </Button>
  );
};

export default UpdateApplicationStatusToBeAccepted;
