import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import App from "../App";

vi.mock("../routes/ProtectedRoute", () => ({
  default: ({ children }) => children,
}));

vi.mock("../pages/Home", () => ({
  default: () => <div>Home Page</div>,
}));

vi.mock("../pages/Auth", () => ({
  default: () => <div>Auth Page</div>,
}));

vi.mock("../pages/Dashboard", () => ({
  default: () => <div>Dashboard Page</div>,
}));

vi.mock("../pages/Profile", () => ({
  default: () => <div>Profile Page</div>,
}));

vi.mock("../pages/Inbox", () => ({
  default: () => <div>Inbox Page</div>,
}));

vi.mock("../pages/Chat", () => ({
  default: () => <div>Chat Page</div>,
}));

describe("App routes", () => {
  it("renders Home page on /", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Home Page")).toBeInTheDocument();
  });

  it("renders Auth page on /auth", async () => {
    render(
      <MemoryRouter initialEntries={["/auth"]}>
        <App />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Auth Page")).toBeInTheDocument();
  });

  it("renders Dashboard page on /dashboard", async () => {
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <App />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Dashboard Page")).toBeInTheDocument();
  });

  it("renders Profile page on /profile/:username", async () => {
    render(
      <MemoryRouter initialEntries={["/profile/mateus"]}>
        <App />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Profile Page")).toBeInTheDocument();
  });

  it("renders Inbox page on /inbox", async () => {
    render(
      <MemoryRouter initialEntries={["/inbox"]}>
        <App />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Inbox Page")).toBeInTheDocument();
  });

  it("renders Chat page on /chat/:id", async () => {
    render(
      <MemoryRouter initialEntries={["/chat/1"]}>
        <App />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Chat Page")).toBeInTheDocument();
  });
});