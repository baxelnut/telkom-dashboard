import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import Loading from "../../components/utils/Loading";

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, authLoading, role } = useAuth();

  if (authLoading) return <Loading backgroundColor="transparent" />;
  if (!user) return <Navigate to="/login" replace />;

  // If a role is required and doesn't match, kick out
  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/login" replace />;
  }

  // Kick out waiting approval users explicitly
  if (role === "waiting approval") {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
