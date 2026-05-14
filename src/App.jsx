import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Auth from "./pages/Auth";
import ProtectedRoute from "./routes/ProtectedRoute";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const Inbox = lazy(() => import("./pages/Inbox"));
const Chat = lazy(() => import("./pages/Chat"));

function PageLoader() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-purple-500 to-fuchsia-500 animate-pulse" />

        <p className="text-sm text-zinc-400 font-bold">
          Loading GymFocus...
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

function App() {
  return (
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
  );
}

export default App;