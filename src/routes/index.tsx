import { RootLayout } from "@/layouts/RootLayout";
import VenueListPage from "@/pages/VenueListPage";
import { LoginPage } from "@/pages/LoginPage";
import {
  createRouter,
  createRootRoute,
  Outlet,
  createRoute,
} from "@tanstack/react-router";
import RegisterPage from "@/pages/RegisterPage";

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
  component: () => (
    <div className="p-10 text-center">Profile page coming soon</div>
  ),
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
  loginRoute,
  registerRoute,
  profileRoute,
  dashboardRoute,
]);

export const router = createRouter({ routeTree });
