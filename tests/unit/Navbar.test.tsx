import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Navbar } from "@/layouts/Navbar";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// TanStack Router — Navbar uses <Link> and useNavigate
const mockNavigate = vi.fn();
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
  useNavigate: () => mockNavigate,
}));

// useAuth — control auth state per test
const mockUseAuth = vi.fn();
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

// useThemeStore — control theme state per test
const mockToggle = vi.fn();
const mockUseThemeStore = vi.fn();
vi.mock("@/store/themeStore", () => ({
  useThemeStore: () => mockUseThemeStore(),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const guestAuth = () =>
  mockUseAuth.mockReturnValue({
    user: null,
    logout: vi.fn(),
    isAuthenticated: false,
    isVenueManager: false,
  });

const customerAuth = () =>
  mockUseAuth.mockReturnValue({
    user: { name: "Alice", venueManager: false, avatar: null },
    logout: vi.fn(),
    isAuthenticated: true,
    isVenueManager: false,
  });

const managerAuth = () =>
  mockUseAuth.mockReturnValue({
    user: { name: "Bob", venueManager: true, avatar: null },
    logout: vi.fn(),
    isAuthenticated: true,
    isVenueManager: true,
  });

const lightTheme = () =>
  mockUseThemeStore.mockReturnValue({ isDark: false, toggle: mockToggle });

const darkTheme = () =>
  mockUseThemeStore.mockReturnValue({ isDark: true, toggle: mockToggle });

// ---------------------------------------------------------------------------
// Guest user
// ---------------------------------------------------------------------------

describe("Navbar — guest (not logged in)", () => {
  beforeEach(() => {
    guestAuth();
    lightTheme();
    render(<Navbar />);
  });

  it("renders the Holidaze logo link", () => {
    expect(screen.getByRole("link", { name: /holidaze/i })).toBeInTheDocument();
  });

  it("renders the Venues nav link", () => {
    expect(
      screen.getAllByRole("link", { name: "Venues" })[0],
    ).toBeInTheDocument();
  });

  it("renders Login link", () => {
    expect(
      screen.getAllByRole("link", { name: "Login" })[0],
    ).toBeInTheDocument();
  });

  it("renders Register link", () => {
    expect(
      screen.getAllByRole("link", { name: "Register" })[0],
    ).toBeInTheDocument();
  });

  it("does not render Profile link", () => {
    expect(
      screen.queryByRole("link", { name: "Profile" }),
    ).not.toBeInTheDocument();
  });

  it("does not render My Venues link", () => {
    expect(
      screen.queryByRole("link", { name: "My Venues" }),
    ).not.toBeInTheDocument();
  });

  it("does not render Logout button", () => {
    expect(
      screen.queryByRole("button", { name: /logout/i }),
    ).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Authenticated customer (not a venue manager)
// ---------------------------------------------------------------------------

describe("Navbar — authenticated customer", () => {
  beforeEach(() => {
    customerAuth();
    lightTheme();
    render(<Navbar />);
  });

  it("renders Profile link", () => {
    expect(
      screen.getAllByRole("link", { name: "Profile" })[0],
    ).toBeInTheDocument();
  });

  it("does not render My Venues link", () => {
    // My Venues link only appears for venue managers
    expect(
      screen.queryByRole("link", { name: "My Venues" }),
    ).not.toBeInTheDocument();
  });

  it("does not render Login or Register links", () => {
    expect(
      screen.queryByRole("link", { name: "Login" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Register" }),
    ).not.toBeInTheDocument();
  });

  it("renders the user's name in the desktop dropdown button", () => {
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Authenticated venue manager
// ---------------------------------------------------------------------------

describe("Navbar — authenticated venue manager", () => {
  beforeEach(() => {
    managerAuth();
    lightTheme();
    render(<Navbar />);
  });

  it("renders Profile link", () => {
    expect(
      screen.getAllByRole("link", { name: "Profile" })[0],
    ).toBeInTheDocument();
  });

  it("does not render a separate My Venues link (venue management is on Profile)", () => {
    expect(
      screen.queryByRole("link", { name: "My Venues" }),
    ).not.toBeInTheDocument();
  });

  it("does not render Login or Register links", () => {
    expect(
      screen.queryByRole("link", { name: "Login" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Register" }),
    ).not.toBeInTheDocument();
  });

  it("renders the manager's name in the desktop dropdown button", () => {
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Theme toggle
// ---------------------------------------------------------------------------

describe("Navbar — theme toggle", () => {
  it("renders Moon icon when theme is light", () => {
    guestAuth();
    lightTheme();
    render(<Navbar />);
    expect(
      screen.getByRole("button", { name: /toggle theme/i }),
    ).toBeInTheDocument();
  });

  it("renders Sun icon when theme is dark", () => {
    guestAuth();
    darkTheme();
    render(<Navbar />);
    expect(
      screen.getByRole("button", { name: /toggle theme/i }),
    ).toBeInTheDocument();
  });

  it("calls toggle when theme button is clicked", async () => {
    guestAuth();
    lightTheme();
    const user = userEvent.setup();
    render(<Navbar />);
    await user.click(screen.getByRole("button", { name: /toggle theme/i }));
    expect(mockToggle).toHaveBeenCalledOnce();
  });
});

// ---------------------------------------------------------------------------
// Mobile menu toggle
// ---------------------------------------------------------------------------

describe("Navbar — mobile menu toggle", () => {
  beforeEach(() => {
    guestAuth();
    lightTheme();
  });

  it("renders the Toggle menu button", () => {
    render(<Navbar />);
    expect(
      screen.getByRole("button", { name: /toggle menu/i }),
    ).toBeInTheDocument();
  });

  it("opens the mobile menu when toggle is clicked", async () => {
    const user = userEvent.setup();
    render(<Navbar />);
    const toggle = screen.getByRole("button", { name: /toggle menu/i });
    await user.click(toggle);
    // Mobile menu nav contains Venues link — now multiple match is expected
    const venueLinks = screen.getAllByRole("link", { name: "Venues" });
    expect(venueLinks.length).toBeGreaterThanOrEqual(2); // desktop + mobile
  });

  it("mobile menu shows Login and Register for guest user after open", async () => {
    const user = userEvent.setup();
    render(<Navbar />);
    await user.click(screen.getByRole("button", { name: /toggle menu/i }));
    const loginLinks = screen.getAllByRole("link", { name: "Login" });
    const registerLinks = screen.getAllByRole("link", { name: "Register" });
    expect(loginLinks.length).toBeGreaterThanOrEqual(1);
    expect(registerLinks.length).toBeGreaterThanOrEqual(1);
  });

  it("mobile menu shows Logout button for authenticated user", async () => {
    customerAuth();
    const user = userEvent.setup();
    render(<Navbar />);
    await user.click(screen.getByRole("button", { name: /toggle menu/i }));
    // Logout button is rendered in mobile nav
    const logoutButtons = screen.getAllByRole("button");
    const logoutBtn = logoutButtons.find((b) =>
      b.textContent?.toLowerCase().includes("logout"),
    );
    expect(logoutBtn).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Logout behavior
// ---------------------------------------------------------------------------

describe("Navbar — logout", () => {
  it("calls logout and navigates to / when Logout is clicked in mobile menu", async () => {
    const mockLogout = vi.fn();
    mockUseAuth.mockReturnValue({
      user: { name: "Alice", venueManager: false, avatar: null },
      logout: mockLogout,
      isAuthenticated: true,
      isVenueManager: false,
    });
    lightTheme();
    const user = userEvent.setup();
    render(<Navbar />);

    // Open mobile menu to access the logout button
    await user.click(screen.getByRole("button", { name: /toggle menu/i }));
    const buttons = screen.getAllByRole("button");
    const logoutBtn = buttons.find((b) =>
      b.textContent?.toLowerCase().includes("logout"),
    );
    expect(logoutBtn).toBeDefined();
    await user.click(logoutBtn!);

    expect(mockLogout).toHaveBeenCalledOnce();
    expect(mockNavigate).toHaveBeenCalledWith({ to: "/" });
  });
});
