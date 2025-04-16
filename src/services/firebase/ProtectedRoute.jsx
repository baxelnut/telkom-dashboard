import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import Loading from "../../components/utils/Loading";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <Loading backgroundColor="transparent" />;
  if (!user) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
