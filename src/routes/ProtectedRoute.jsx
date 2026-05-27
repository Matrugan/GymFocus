import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import AppSplash from "../components/layout/AppSplash";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <AppSplash compact />;
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return children;
}

export default ProtectedRoute;
