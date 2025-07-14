import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
// Components
import Loading from "../components/ui/states/Loading";

export function ProtectedRoute({ children }) {
  const { user, authLoading, isApprovedUser } = useAuth();
  if (authLoading)
    return (
      <div className="app-container">
        <Loading backgroundColor="transparent" />
      </div>
    );
  if (!user || !isApprovedUser) return <Navigate to="/login" replace />;
  return children;
}

export function RedirectIfLoggedIn({ children }) {
  const { user, authLoading, isApprovedUser } = useAuth();
  if (authLoading)
    return (
      <div className="app-container">
        <Loading backgroundColor="transparent" />
      </div>
    );
  if (user && isApprovedUser) return <Navigate to="/overview" replace />;
  return children;
}

export function VerifiedRoute({ children }) {
  const { user, authLoading } = useAuth();
  if (authLoading)
    return (
      <div className="app-container">
        <Loading backgroundColor="transparent" />
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  if (!user.emailVerified) return <Navigate to="/verify-email" replace />;
  return children;
}
