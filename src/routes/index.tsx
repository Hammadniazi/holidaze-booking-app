import { RootLayout } from "@/layouts/RootLayout";
import VenueListPage from "@/pages/VenueListPage";
import {
  createRouter,
  createRootRoute,
  Outlet,
  createRoute,
} from "@tanstack/react-router";

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

const routeTree = rootRoute.addChildren([indexRoute]);

export const router = createRouter({ routeTree });
