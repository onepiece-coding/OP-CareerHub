/**
 * @file src/components/guards/can-activate/index.tsx
 */

import { useAppSelector } from "@/store/hooks";
import { Navigate } from "react-router-dom";
import type { Role } from "@/lib/types";
import {
  selectCurrentUserRole,
  selectIsAuthenticated,
} from "@/store/auth/auth-selectors";

interface CanActivateProps {
  children: React.ReactNode;
  roles: Role[];
}

const CanActivate = ({ children, roles }: CanActivateProps) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const currentUserRole = useAppSelector(selectCurrentUserRole);

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (currentUserRole === undefined) {
    return null; // or <Spinner /> for better UX
  }

  if (!roles.includes(currentUserRole)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default CanActivate;
