import { useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, isSignedIn, isLoaded } = useUser();

  if (!isLoaded) return null;

  if (!isSignedIn) return <Navigate to="/select-role" replace />;

  const clerkRole = user?.publicMetadata?.role;

  if (!clerkRole) return <Navigate to="/unauthorized" replace />;

  if (!allowedRoles.includes(clerkRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
