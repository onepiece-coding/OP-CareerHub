import { useContext } from "react";
import { JobsContext } from "../contexts";

export function useJobsContext() {
  return useContext(JobsContext);
}
