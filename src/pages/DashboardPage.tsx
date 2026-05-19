import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { VenueManagement } from "@/components/dashboard/VenueManagement";

const DashboardPage = () => {
  const { isAuthenticated, isVenueManager } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      void navigate({ to: "/login" });
    } else if (!isVenueManager) {
      void navigate({ to: "/profile" });
    }
  }, [isAuthenticated, isVenueManager, navigate]);

  if (!isAuthenticated || !isVenueManager) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <VenueManagement />
    </div>
  );
};

export default DashboardPage;
