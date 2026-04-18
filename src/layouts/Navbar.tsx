import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <span>Holidaze</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Venues
            </Link>
          </nav>

          {/* Auth buttons */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" render={<Link to="/login" />}>
              Log in
            </Button>
            <Button size="sm" render={<Link to="/register" />}>
              Register
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
