import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { VenueManagement } from "@/components/dashboard/VenueManagement";
import { Container } from "@/components/ui/container";

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
    <Container className="py-8">
      <VenueManagement />
    </Container>
  );
};

export default DashboardPage;
