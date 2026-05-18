import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Footer from "@/layouts/Footer";

// Mock TanStack Router — Footer uses <Link> which requires a router context
vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    to,
    ...rest
  }: {
    children: React.ReactNode;
    to: string;
    [key: string]: unknown;
  }) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
}));

// Mock useAuth so we can control auth state per test
const mockUseAuth = vi.fn();
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

// scrollTo is not implemented in jsdom
beforeEach(() => {
  Object.defineProperty(window, "scrollTo", { value: vi.fn(), writable: true });
});

describe("Footer — unauthenticated", () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isVenueManager: false,
    });
    render(<Footer />);
  });

  it("renders the Holidaze brand name", () => {
    expect(screen.getByText("Holidaze")).toBeInTheDocument();
  });

  it("renders the tagline", () => {
    expect(
      screen.getByText(/Find and book unique venues/i),
    ).toBeInTheDocument();
  });

  it("renders Login link when not authenticated", () => {
    expect(screen.getByRole("link", { name: "Login" })).toBeInTheDocument();
  });

  it("renders Register link when not authenticated", () => {
    expect(screen.getByRole("link", { name: "Register" })).toBeInTheDocument();
  });

  it("does not render My profile link when not authenticated", () => {
    expect(
      screen.queryByRole("link", { name: "My profile" }),
    ).not.toBeInTheDocument();
  });

  it("does not render My Venues link when not authenticated", () => {
    expect(
      screen.queryByRole("link", { name: "My Venues" }),
    ).not.toBeInTheDocument();
  });

  it("renders Browse venues link", () => {
    expect(
      screen.getByRole("link", { name: "Browse venues" }),
    ).toBeInTheDocument();
  });

  it("renders Contact us link", () => {
    expect(
      screen.getByRole("link", { name: "Contact us" }),
    ).toBeInTheDocument();
  });

  it("renders social icon links for GitHub, LinkedIn, and Twitter/X", () => {
    expect(
      screen.getByRole("link", { name: "GitHub (opens in new tab)" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "LinkedIn (opens in new tab)" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Twitter / X (opens in new tab)" }),
    ).toBeInTheDocument();
  });

  it("renders the back-to-top button", () => {
    expect(
      screen.getByRole("button", { name: /back to top/i }),
    ).toBeInTheDocument();
  });

  it("renders the copyright notice with the current year", () => {
    const year = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(year))).toBeInTheDocument();
  });
});

describe("Footer — authenticated customer (not venue manager)", () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isVenueManager: false,
    });
    render(<Footer />);
  });

  it("renders My profile link", () => {
    expect(
      screen.getByRole("link", { name: "My profile" }),
    ).toBeInTheDocument();
  });

  it("does not render My Venues link for a regular customer", () => {
    expect(
      screen.queryByRole("link", { name: "My Venues" }),
    ).not.toBeInTheDocument();
  });

  it("does not render Login link when authenticated", () => {
    expect(
      screen.queryByRole("link", { name: "Login" }),
    ).not.toBeInTheDocument();
  });
});

describe("Footer — authenticated venue manager", () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isVenueManager: true,
    });
    render(<Footer />);
  });

  it("renders My profile link", () => {
    expect(
      screen.getByRole("link", { name: "My profile" }),
    ).toBeInTheDocument();
  });

  it("does not render a separate My Venues link (venue management is on Profile)", () => {
    expect(
      screen.queryByRole("link", { name: "My Venues" }),
    ).not.toBeInTheDocument();
  });
});

describe("Footer — back-to-top interaction", () => {
  it("calls window.scrollTo when back-to-top is clicked", async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isVenueManager: false,
    });
    const user = userEvent.setup();
    render(<Footer />);
    const btn = screen.getByRole("button", { name: /back to top/i });
    await user.click(btn);
    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: "smooth",
    });
  });
});
