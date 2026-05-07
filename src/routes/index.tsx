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

// Root route with layout
const rootRoute = createRootRoute({
  component: () => (
    <RootLayout>
      <Outlet />
    </RootLayout>
  ),
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

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: ProfilePage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: () => (
    <div className="p-10 text-center">Dashboard page coming soon</div>
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  venueRoute,
  loginRoute,
  registerRoute,
  profileRoute,
  dashboardRoute,
]);

export const router = createRouter({ routeTree });
