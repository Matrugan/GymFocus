import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import AppSplash from "../components/layout/AppSplash";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <AppSplash compact />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}

export default ProtectedRoute;
