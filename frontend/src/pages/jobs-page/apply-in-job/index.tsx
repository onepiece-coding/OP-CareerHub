/**
 * @file src/pages/apply-in-job/index.tsx
 */

import { applyInJob } from "@/store/applications/applications-slice";
import { addToast } from "@/store/toasts/toasts-slice";
import { useAppDispatch } from "@/store/hooks";
import { Button } from "@/components/ui";
import { useState } from "react";

interface ApplyJobProps {
  position?: string;
  company?: string;
  jobId: string;
}

const ApplyInJob = ({ jobId, position, company }: ApplyJobProps) => {
  const [loading, setLoading] = useState(false);

  const dispatch = useAppDispatch();

  const handleApplyInJob = async (jobId: string) => {
    if (!jobId) return;

    setLoading(true);

    try {
      await dispatch(applyInJob(jobId)).unwrap();

      dispatch(
        addToast({
          type: "success",
          message: "Successfully applied",
        }),
      );
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Apply In Job:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      aria-label={`Apply for ${position ?? "this job"}${company ? ` at ${company}` : ""}`}
      onClick={() => handleApplyInJob(jobId)}
      aria-busy={loading}
      variant="slate"
    >
      {loading ? "Applying..." : "Apply"}
    </Button>
  );
};

export default ApplyInJob;
