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

vi.mock("../pages/Download", () => ({
  default: () => <div>Download Page</div>,
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

  it("redirects /auth to the site signup page", async () => {
    render(
      <MemoryRouter initialEntries={["/auth"]}>
        <App />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Auth Page")).toBeInTheDocument();
  });

  it("renders Auth page on /signup", async () => {
    render(
      <MemoryRouter initialEntries={["/signup"]}>
        <App />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Auth Page")).toBeInTheDocument();
  });

  it("renders Download page on /download", async () => {
    render(
      <MemoryRouter initialEntries={["/download"]}>
        <App />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Download Page")).toBeInTheDocument();
  });

  it("redirects internal app routes to Home on the website", async () => {
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <App />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Home Page")).toBeInTheDocument();
  });
});
