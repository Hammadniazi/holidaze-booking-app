import { useParams } from "@tanstack/react-router";
import { VenueDetailPage } from "./VenueDetailPage";

/**
 * Reads the route param so VenueDetailPage can keep taking `id` as a prop.
 *
 * It lives here rather than inline in the route tree so the whole venue-detail
 * page, react-day-picker included, stays behind one dynamic import.
 */
export function VenueDetailRoute() {
  const { id } = useParams({ from: "/venue/$id" });
  return <VenueDetailPage id={id} />;
}
