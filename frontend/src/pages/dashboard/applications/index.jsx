import { useProfileContext } from "../../../hooks/useProfileContext";
import { Applicant, Recruiter } from "../../../components/dashboard";

const Applications = () => {
  const { user } = useProfileContext();

  return user?.role === "user" ? (
    <Applicant />
  ) : user?.role === "recruiter" ? (
    <Recruiter />
  ) : null;
};

export default Applications;
