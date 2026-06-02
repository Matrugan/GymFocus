import { lazy, Suspense, useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";

import Home from "./pages/Home";
import Auth from "./pages/Auth";
import ProtectedRoute from "./routes/ProtectedRoute";
import AppSplash from "./components/layout/AppSplash";
import { useAuth } from "./context/AuthContext";
import { workoutTimerNotification } from "./utils/workoutTimerNotification";

const CHUNK_RELOAD_STORAGE_KEY = "gymfocus-chunk-reload-at";

function isChunkLoadError(error) {
  const message = String(error?.message || error || "").toLowerCase();

  return (
    message.includes("failed to fetch dynamically imported module") ||
    message.includes("importing a module script failed") ||
    message.includes("expected a javascript-or-wasm module script") ||
    message.includes("chunkloaderror")
  );
}

function lazyWithChunkRetry(importer) {
  return lazy(() =>
    importer().catch((error) => {
      if (!Capacitor.isNativePlatform() && isChunkLoadError(error)) {
        const lastReloadAt = Number(
          sessionStorage.getItem(CHUNK_RELOAD_STORAGE_KEY) || 0,
        );
        const reloadIsRecent = Date.now() - lastReloadAt < 60_000;

        if (!reloadIsRecent) {
          sessionStorage.setItem(CHUNK_RELOAD_STORAGE_KEY, String(Date.now()));
          window.location.reload();
          return new Promise(() => {});
        }
      }

      throw error;
    }),
  );
}

const Dashboard = lazyWithChunkRetry(() => import("./pages/Dashboard"));
const Profile = lazyWithChunkRetry(() => import("./pages/Profile"));
const Inbox = lazyWithChunkRetry(() => import("./pages/Inbox"));
const Chat = lazyWithChunkRetry(() => import("./pages/Chat"));
const Download = lazyWithChunkRetry(() => import("./pages/Download"));

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

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRoute />} />

      <Route
        path="/auth"
        element={<Auth key="login" initialView="login" />}
      />

      <Route
        path="/signup"
        element={<Auth key="signup" initialView="signup" />}
      />

      <Route
        path="/download"
        element={
          <Suspense fallback={<PageLoader />}>
            <Download />
          </Suspense>
        }
      />

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
  );
}

function App() {
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    if (!isNative) return;

    void workoutTimerNotification.scheduleDailyReminders().catch(() => {
      // The user can deny notification permission; the app should keep opening normally.
    });
  }, [isNative]);

  return (
    <>
      <OAuthRedirectHandler />
      <AppRoutes />
    </>
  );
}

export default App;
