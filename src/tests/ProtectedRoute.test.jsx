import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import ProtectedRoute from "../routes/ProtectedRoute";

let authState = {
  loading: false,
  user: null,
};

vi.mock("../context/AuthContext", () => ({
  useAuth: () => authState,
}));

function AuthProbe() {
  const location = useLocation();

  return <div>Redirected from {location.state?.from?.pathname}</div>;
}

describe("ProtectedRoute", () => {
  it("redirects unauthenticated users to login with the original path", async () => {
    authState = {
      loading: false,
      user: null,
    };

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/auth" element={<AuthProbe />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Dashboard</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText("Redirected from /dashboard")).toBeInTheDocument();
  });

  it("renders children for authenticated users", async () => {
    authState = {
      loading: false,
      user: { id: "user-1" },
    };

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Dashboard</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText("Dashboard")).toBeInTheDocument();
  });
});
