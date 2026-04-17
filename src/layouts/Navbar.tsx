import { Link } from "@tanstack/react-router";


const Navbar = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b ">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <span className="">Holidaze</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-sm font-medium "
            >
              Venues
            </Link>
            {
              <Link
                to="/profile"
                className="text-sm font-medium "
              >
                Profile
              </Link>
            }
            {
              <Link
                to="/dashboard"
                className="text-sm font-medium "
              >
                Dashboard
              </Link>
            }
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
