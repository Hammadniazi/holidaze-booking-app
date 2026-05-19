import { RootLayout } from "@/layouts/RootLayout";
import { VenueListPage } from "@/pages/VenueListPage";
import { LoginPage } from "@/pages/LoginPage";
import {
  createRouter,
  createRootRoute,
  Outlet,
  createRoute,
} from "@tanstack/react-router";
import RegisterPage from "@/pages/RegisterPage";
import { VenueDetailPage } from "@/pages/VenueDetailPage";
import ProfilePage from "@/pages/ProfilePage";
import DashboardPage from "@/pages/DashboardPage";
import ContactPage from "@/pages/ContactPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

// Root route with layout
const rootRoute = createRootRoute({
  component: () => (
    <RootLayout>
      <Outlet />
    </RootLayout>
  ),
  notFoundComponent: NotFoundPage,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: VenueListPage,
});

//  Venue Detail
const venueRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "venue/$id",
  component: function VenueDetailRoute() {
    const { id } = venueRoute.useParams();
    return <VenueDetailPage id={id} />;
  },
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: RegisterPage,
});

export const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  validateSearch: (search: Record<string, unknown>) => ({
    tab: search.tab === "trips" ? ("trips" as const) : undefined,
  }),
  component: ProfilePage,
});

const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/contact",
  component: ContactPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  venueRoute,
  loginRoute,
  registerRoute,
  profileRoute,
  contactRoute,
  dashboardRoute,
]);

export const router = createRouter({
  routeTree,
  defaultNotFoundComponent: NotFoundPage,
});
