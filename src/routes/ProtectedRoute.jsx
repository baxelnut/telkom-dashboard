import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (user === undefined) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export function RedirectIfLoggedIn({ children }) {
  const { user } = useAuth();
  if (user === undefined) return null;
  if (user) return <Navigate to="/overview" replace />;
  return children;
}

export function VerifiedRoute({ children }) {
  const { user } = useAuth();
  if (user === undefined) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.emailVerified) return <Navigate to="/verify-email" replace />;
  return children;
}
