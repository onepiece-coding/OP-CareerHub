/**
 * @file src/pages/dashboard/recruiter/recruiter-jobs/delete-recruiter-job.component.tsx
 */

import { deleteRecruiterJob } from "@/store/jobs/jobs-slice";
import { addToast } from "@/store/toasts/toasts-slice";
import { Badge, ConfirmDialog } from "@/components/ui";
import { TrashIcon } from "@/components/icons";
import { useAppDispatch } from "@/store/hooks";
import { useState } from "react";

interface DeleteRecruiterJobProps {
  company: string;
  jobId: string;
}

const DeleteRecruiterJob = ({ jobId, company }: DeleteRecruiterJobProps) => {
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const dispatch = useAppDispatch();

  const handleDeleteRecruiterJob = async (jobId: string) => {
    if (!jobId) return;

    setLoading(true);

    try {
      await dispatch(deleteRecruiterJob(jobId)).unwrap();

      dispatch(
        addToast({
          type: "success",
          message: "Job deleted successfully",
        }),
      );
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error("Delete User:", error);
      }
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <Badge as="button" variant="red" onClick={() => setIsOpen(true)}>
        <TrashIcon />
      </Badge>

      <ConfirmDialog
        message="Are you sure you want to delete this job?"
        onConfirm={() => handleDeleteRecruiterJob(jobId)}
        title={`Delete Job From ${company} Company`}
        onCancel={() => setIsOpen(false)}
        isLoading={loading}
        isOpen={isOpen}
      />
    </>
  );
};

export default DeleteRecruiterJob;
