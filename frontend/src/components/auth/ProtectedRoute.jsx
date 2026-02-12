import { useProfileContext } from "../../hooks/useProfileContext.js";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, roles }) => {
  const { userStatus, user } = useProfileContext();

  if (!userStatus.status) {
    return <Navigate to={"/login?message=login_required"} />;
  } else if (roles) {
    if (!roles.includes(user?.role)) {
      return <Navigate to={"/?message=unauthorized"} />;
    }
  }

  return children;
};

export default ProtectedRoute;
