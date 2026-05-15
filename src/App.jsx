import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";

import Home from "./pages/Home";
import Auth from "./pages/Auth";
import ProtectedRoute from "./routes/ProtectedRoute";
import BrandLogo from "./components/layout/BrandLogo";
import { useLanguage } from "./context/LanguageContext";
import { useAuth } from "./context/AuthContext";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const Inbox = lazy(() => import("./pages/Inbox"));
const Chat = lazy(() => import("./pages/Chat"));

function PageLoader() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <BrandLogo
          layout="stacked"
          size="sm"
          className="animate-pulse"
        />

        <p className="mt-4 text-sm text-zinc-400 font-bold">
          {t("app.loading")}
        </p>
      </div>
    </div>
  );
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

function App() {
  return (
    <>
      <OAuthRedirectHandler />

      <Routes>
        <Route path="/" element={<Home />} />

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
      </Routes>
    </>
  );
}

export default App;
