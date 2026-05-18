import { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  Menu,
  X,
  MapPin,
  LogOut,
  User,
  Moon,
  Sun,
} from "lucide-react";
import { cn } from "@/utils";
import { useThemeStore } from "@/store/themeStore";

export const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const { isDark, toggle } = useThemeStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate({ to: "/" });
  };

  // Close dropdown on Escape key
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDropdownOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [dropdownOpen]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-(--color-border) bg-(--color-background)/95 backdrop-blur supports-backdrop-filter:bg-(--color-background)/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <MapPin
              className="h-6 w-6 text-(--color-primary)"
              aria-hidden="true"
            />
            <span className="text-(--color-foreground)">Holidaze</span>
          </Link>

          {/* Desktop Nav */}
          <nav
            aria-label="Primary"
            className="hidden md:flex items-center gap-6"
          >
            <Link
              to="/"
              className="text-sm font-medium text-(--color-muted-foreground) hover:text-(--color-foreground) transition-colors [&.active]:text-(--color-foreground)"
            >
              Venues
            </Link>
            {isAuthenticated && (
              <Link
                to="/profile"
                className="text-sm font-medium text-(--color-muted-foreground) hover:text-(--color-foreground) transition-colors [&.active]:text-(--color-foreground)"
              >
                Profile
              </Link>
            )}
            <Link
              to="/contact"
              className="text-sm font-medium text-(--color-muted-foreground) hover:text-(--color-foreground) transition-colors [&.active]:text-(--color-foreground)"
            >
              Contact
            </Link>
          </nav>

          {/* Right area */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            {/* Auth area */}
            {isAuthenticated ? (
              <div className="relative hidden md:block">
                <Button
                  variant="ghost"
                  className="flex items-center gap-2"
                  onClick={() => setDropdownOpen((p) => !p)}
                  aria-expanded={dropdownOpen}
                  aria-haspopup="menu"
                  id="user-menu-button"
                >
                  {user?.avatar?.url ? (
                    <img
                      src={user.avatar.url}
                      alt={user.avatar.alt || user.name}
                      className="h-7 w-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-(--color-primary) flex items-center justify-center text-xs font-bold text-white">
                      {user?.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-medium">{user?.name}</span>
                </Button>

                {dropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setDropdownOpen(false)}
                    />
                    <div
                      role="menu"
                      aria-labelledby="user-menu-button"
                      className="absolute right-0 top-full mt-1 z-20 w-48 rounded-(--radius) border border-(--color-border) bg-(--color-background) shadow-lg py-1"
                    >
                      <Link
                        to="/profile"
                        role="menuitem"
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-(--color-accent) transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <User className="h-4 w-4" aria-hidden="true" /> Profile
                      </Link>

                      <hr className="my-1 border-(--color-border)" />
                      <button
                        role="menuitem"
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-(--color-destructive) hover:bg-(--color-accent) transition-colors"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4" aria-hidden="true" /> Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/register">Register</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen((p) => !p)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}

      <div
        className={cn(
          "md:hidden border-t border-(--color-border) bg-(--color-background) overflow-hidden transition-all duration-200",
          mobileOpen ? "max-h-96" : "max-h-0",
        )}
      >
        <nav aria-label="Mobile" className="flex flex-col p-4 gap-2">
          <Link
            to="/"
            className="rounded-(--radius) px-3 py-2 text-sm font-medium hover:bg-(--color-accent) transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            Venues
          </Link>
          {isAuthenticated && (
            <Link
              to="/profile"
              className="rounded-(--radius) px-3 py-2 text-sm font-medium hover:bg-(--color-accent) transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Profile
            </Link>
          )}
          <Link
            to="/contact"
            className="rounded-(--radius) px-3 py-2 text-sm font-medium hover:bg-(--color-accent) transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            Contact
          </Link>

          {!isAuthenticated ? (
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  Login
                </Link>
              </Button>
              <Button size="sm" className="flex-1" asChild>
                <Link to="/register" onClick={() => setMobileOpen(false)}>
                  Register
                </Link>
              </Button>
            </div>
          ) : (
            <button
              className="flex items-center gap-2 rounded-(--radius) px-3 py-2 text-sm font-medium text-(--color-destructive) hover:bg-(--color-accent) transition-colors text-left"
              onClick={() => {
                handleLogout();
                setMobileOpen(false);
              }}
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
