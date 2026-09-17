import { RootLayout } from "@/layouts/RootLayout";
import { VenueListPage } from "@/pages/VenueListPage";
import {
  createRouter,
  createRootRoute,
  Outlet,
  createRoute,
  lazyRouteComponent,
} from "@tanstack/react-router";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { RoutePending } from "@/components/ui/route-pending";
import { parseVenueListSearch } from "@/components/venues/venueListSearch";
import { toSafeRedirect } from "@/utils";

const authSearch = (search: Record<string, unknown>) => ({
  redirect: toSafeRedirect(search.redirect),
});

// Root route with layout
const rootRoute = createRootRoute({
  component: () => (
    <RootLayout>
      <Outlet />
    </RootLayout>
  ),
  notFoundComponent: NotFoundPage,
});

/* The venue list is the entry point for nearly every visit, so it stays in the
   first chunk. Everything below is split: browsing a venue should not download
   the dashboard, the profile, or react-day-picker. */
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  validateSearch: parseVenueListSearch,
  component: VenueListPage,
});

//  Venue Detail
const venueRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "venue/$id",
  component: lazyRouteComponent(
    () => import("@/pages/VenueDetailRoute"),
    "VenueDetailRoute",
  ),
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  validateSearch: authSearch,
  component: lazyRouteComponent(() => import("@/pages/LoginPage"), "LoginPage"),
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  validateSearch: authSearch,
  component: lazyRouteComponent(() => import("@/pages/RegisterPage")),
});

export const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  validateSearch: (search: Record<string, unknown>) => ({
    tab: search.tab === "trips" ? ("trips" as const) : undefined,
  }),
  component: lazyRouteComponent(() => import("@/pages/ProfilePage")),
});

// Favourites live in localStorage, so this needs no auth guard — the list is
// per-device and means something whether or not anyone is signed in.
const savedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/saved",
  component: lazyRouteComponent(
    () => import("@/pages/SavedVenuesPage"),
    "SavedVenuesPage",
  ),
});

const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/contact",
  component: lazyRouteComponent(() => import("@/pages/ContactPage")),
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: lazyRouteComponent(() => import("@/pages/DashboardPage")),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  venueRoute,
  loginRoute,
  registerRoute,
  profileRoute,
  savedRoute,
  contactRoute,
  dashboardRoute,
]);

export const router = createRouter({
  routeTree,
  defaultNotFoundComponent: NotFoundPage,
  // Shown while a split chunk is in flight. Without it the layout holds its
  // last frame and the navigation reads as a dropped click.
  defaultPendingComponent: RoutePending,
  // Long enough that a cached chunk never flashes a spinner on its way in.
  defaultPendingMs: 300,
});
