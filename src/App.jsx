import { lazy, Suspense, useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";

import Home from "./pages/Home";
import Auth from "./pages/Auth";
import ProtectedRoute from "./routes/ProtectedRoute";
import AppSplash from "./components/layout/AppSplash";
import { useAuth } from "./context/AuthContext";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const Inbox = lazy(() => import("./pages/Inbox"));
const Chat = lazy(() => import("./pages/Chat"));
const Download = lazy(() => import("./pages/Download"));

function PageLoader() {
  return <AppSplash compact />;
}

function ProtectedLazyPage({ children }) {
  return (
    <ProtectedRoute>
      <Suspense fallback={<PageLoader />}>
        {children}
      </Suspense>
    </ProtectedRoute>
  );
}

function OAuthRedirectHandler() {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();
  const { loading = false, user = null } = auth || {};

  useEffect(() => {
    if (loading || !user) return;

    const redirectPath = sessionStorage.getItem("gymfocus_oauth_redirect");

    if (!redirectPath) return;

    sessionStorage.removeItem("gymfocus_oauth_redirect");

    if (location.pathname !== redirectPath) {
      navigate(redirectPath, { replace: true });
    }
  }, [loading, location.pathname, navigate, user]);

  return null;
}

function RootRoute() {
  const { loading = false, user = null } = useAuth() || {};

  if (!Capacitor.isNativePlatform()) {
    return <Home />;
  }

  if (loading) {
    return <AppSplash compact />;
  }

  return <Navigate to={user ? "/dashboard" : "/auth"} replace />;
}

function App() {
  const isNative = Capacitor.isNativePlatform();

  return (
    <>
      <OAuthRedirectHandler />

      {isNative ? (
        <Routes>
          <Route path="/" element={<RootRoute />} />

          <Route path="/auth" element={<Auth />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedLazyPage>
                <Dashboard />
              </ProtectedLazyPage>
            }
          />

          <Route
            path="/profile/:username"
            element={
              <ProtectedLazyPage>
                <Profile />
              </ProtectedLazyPage>
            }
          />

          <Route
            path="/inbox"
            element={
              <ProtectedLazyPage>
                <Inbox />
              </ProtectedLazyPage>
            }
          />

          <Route
            path="/chat/:id"
            element={
              <ProtectedLazyPage>
                <Chat />
              </ProtectedLazyPage>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      ) : (
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Auth siteMode />} />
          <Route
            path="/download"
            element={
              <Suspense fallback={<PageLoader />}>
                <Download />
              </Suspense>
            }
          />
          <Route path="/auth" element={<Navigate to="/signup" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </>
  );
}

export default App;
