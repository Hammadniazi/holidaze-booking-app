import { Link } from "@tanstack/react-router";
import { ArrowUp, MapPin } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

// Inline SVG brand icons — lucide-react v1 removed social brand icons
const GitHubIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-5 w-5"
    aria-hidden="true"
  >
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-5 w-5"
    aria-hidden="true"
  >
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065Zm1.782 13.019H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z" />
  </svg>
);

const TwitterIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-5 w-5"
    aria-hidden="true"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.258 5.63 5.906-5.63Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
  </svg>
);

const SOCIAL_LINKS = [
  {
    label: "GitHub",
    href: "https://github.com/",
    Icon: GitHubIcon,
    colorClass: "text-neutral-700 dark:text-neutral-300",
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/",
    Icon: LinkedInIcon,
    colorClass: "text-blue-600",
  },
  {
    label: "Twitter / X",
    href: "https://twitter.com/",
    Icon: TwitterIcon,
    colorClass: "text-sky-500",
  },
];

const Footer = () => {
  const { isAuthenticated } = useAuth();
  const year = new Date().getFullYear();

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="border-t border-(--color-border) bg-(--color-background)">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Main grid: 1 col mobile → 2 col tablet → 4 col desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link
              to="/"
              className="flex items-center gap-2 font-bold text-lg mb-3"
            >
              <MapPin
                className="h-5 w-5 text-(--color-primary)"
                aria-hidden="true"
              />
              <span className="text-(--color-foreground)">Holidaze</span>
            </Link>
            <p className="text-sm text-(--color-muted-foreground) leading-relaxed">
              Find and book unique venues for your next getaway.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-sm font-semibold text-(--color-foreground) mb-3">
              Explore
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-sm text-(--color-muted-foreground) hover:text-(--color-foreground) transition-colors"
                >
                  Browse venues
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-sm text-(--color-muted-foreground) hover:text-(--color-foreground) transition-colors"
                >
                  Contact us
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-semibold text-(--color-foreground) mb-3">
              Account
            </h3>
            <ul className="space-y-2">
              {!isAuthenticated ? (
                <>
                  <li>
                    <Link
                      to="/login"
                      className="text-sm text-(--color-muted-foreground) hover:text-(--color-foreground) transition-colors"
                    >
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/register"
                      className="text-sm text-(--color-muted-foreground) hover:text-(--color-foreground) transition-colors"
                    >
                      Register
                    </Link>
                  </li>
                </>
              ) : (
                <li>
                  <Link
                    to="/profile"
                    className="text-sm text-(--color-muted-foreground) hover:text-(--color-foreground) transition-colors"
                  >
                    My profile
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-sm font-semibold text-(--color-foreground) mb-3">
              Connect
            </h3>
            <div className="flex items-center gap-1">
              {SOCIAL_LINKS.map(({ label, href, Icon, colorClass }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${label} (opens in new tab)`}
                  className={`h-10 w-10 rounded-(--radius) flex items-center justify-center hover:bg-(--color-accent) transition-colors ${colorClass}`}
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar: copyright left · back-to-top right */}
        <div className="mt-8 pt-6 border-t border-(--color-border) flex items-center justify-between">
          <p className="text-xs text-(--color-muted-foreground)">
            © {year} Holidaze. All rights reserved.
          </p>
          <button
            onClick={scrollToTop}
            aria-label="Back to top"
            className="h-8 w-8 rounded-full border border-(--color-border) flex items-center justify-center text-(--color-muted-foreground) hover:border-(--color-primary) hover:text-(--color-primary) transition-colors"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
