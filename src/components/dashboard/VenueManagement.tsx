import { useCallback, useEffect, useState } from "react";
import { ApiError, profilesApi, venuesApi } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import type { ApiResponse, Booking, Venue } from "@/types";
import { buildImageUrl, formatPrice, VENUE_PLACEHOLDER } from "@/utils";
import { Building2, Calendar, Edit, ExternalLink, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { VenueForm } from "./VenueForm";
import { Link } from "@tanstack/react-router";

export const VenueManagement = () => {
  const { user } = useAuth();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editVenue, setEditVenue] = useState<Venue | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [bookingsExpanded, setBookingsExpanded] = useState<string | null>(null);

  const fetchVenues = useCallback(async () => {
    if (!user) return;
    try {
      const res = (await profilesApi.getVenues(user.name)) as ApiResponse<
        Venue[]
      >;
      setVenues(res.data);
    } catch {
      toast.error("Failed to load venues");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void fetchVenues();
  }, [fetchVenues]);

  const totalBookings = venues.reduce(
    (acc, v) => acc + (v._count?.bookings ?? v.bookings?.length ?? 0),
    0,
  );

  const handleDelete = async (id: string) => {
    try {
      await venuesApi.delete(id);
      setVenues((prev) => prev.filter((v) => v.id !== id));
      toast.success("Venue deleted");
    } catch (error) {
      const msg =
        error instanceof ApiError ? error.message : "Failed to delete venue";
      toast.error(msg);
    }
    setDeleteConfirm(null);
  };

  const handleVenueSuccess = (venue: Venue) => {
    setVenues((prev) => {
      const exists = prev.findIndex((v) => v.id === venue.id);
      if (exists >= 0) {
        const updated = [...prev];
        updated[exists] = venue;
        return updated;
      }
      return [venue, ...prev];
    });
    setCreateOpen(false);
    setEditVenue(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div role="status" aria-label="Loading venues">
          <div
            className="animate-spin h-8 w-8 rounded-full border-2 border-(--color-primary) border-t-transparent"
            aria-hidden="true"
          />
          <span className="sr-only">Loading venues...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Building2
            className="h-5 w-5 text-(--color-primary)"
            aria-hidden="true"
          />
          My Venues
        </h2>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add venue
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{venues.length}</p>
            <p className="text-xs text-(--color-muted-foreground)">
              Venues listed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{totalBookings}</p>
            <p className="text-xs text-(--color-muted-foreground)">
              Total bookings
            </p>
          </CardContent>
        </Card>
        <Card className="hidden sm:block">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">
              {formatPrice(
                venues.reduce((acc, v) => acc + v.price, 0) /
                  (venues.length || 1),
              )}
            </p>
            <p className="text-xs text-(--color-muted-foreground)">
              Avg. price / night
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Venues list */}
      {venues.length === 0 ? (
        <div className="text-center py-16 rounded-(--radius) border border-dashed border-(--color-border)">
          <Building2 className="mx-auto h-12 w-12 text-(--color-muted-foreground) mb-4" />
          <h3 className="text-xl font-semibold mb-2">No venues yet</h3>
          <p className="text-(--color-muted-foreground) mb-4">
            Create your first venue to start accepting bookings.
          </p>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Create venue
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {venues.map((venue) => (
            <Card key={venue.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  <div className="h-44 sm:h-auto w-full sm:w-32 shrink-0 overflow-hidden bg-(--color-muted)">
                    <Link
                      to="/venue/$id"
                      params={{ id: venue.id }}
                      aria-label={`Preview listing: ${venue.name}`}
                      className="block h-full w-full"
                    >
                      <img
                        src={buildImageUrl(
                          venue.media[0]?.url,
                          VENUE_PLACEHOLDER,
                        )}
                        alt={venue.name}
                        className="h-full w-full object-cover transition-opacity hover:opacity-90"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = VENUE_PLACEHOLDER;
                        }}
                      />
                    </Link>
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <Link
                          to="/venue/$id"
                          params={{ id: venue.id }}
                          className="group/title inline-flex items-center gap-1 font-semibold hover:text-(--color-primary) transition-colors"
                        >
                          <span className="truncate">{venue.name}</span>
                          <ExternalLink className="h-3 w-3 shrink-0 opacity-0 group-hover/title:opacity-60 transition-opacity" aria-hidden="true" />
                        </Link>
                        <p className="text-sm text-(--color-muted-foreground)">
                          {formatPrice(venue.price)} / night · Up to{" "}
                          {venue.maxGuests} guests
                        </p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditVenue(venue)}
                          aria-label="Edit venue"
                        >
                          <Edit className="h-4 w-4 sm:mr-1" />
                          <span className="hidden sm:inline">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-(--color-destructive) hover:text-(--color-destructive) hover:bg-destructive/10"
                          onClick={() => setDeleteConfirm(venue.id)}
                          aria-label="Delete venue"
                        >
                          <Trash2 className="h-4 w-4 sm:mr-1" />
                          <span className="hidden sm:inline">Delete</span>
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-2">
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1 text-xs"
                      >
                        <Calendar className="h-3 w-3" />
                        {venue._count?.bookings ??
                          venue.bookings?.length ??
                          0}{" "}
                        booking(s)
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-6 px-2"
                        aria-expanded={bookingsExpanded === venue.id}
                        aria-controls={`bookings-${venue.id}`}
                        onClick={() =>
                          setBookingsExpanded(
                            bookingsExpanded === venue.id ? null : venue.id,
                          )
                        }
                      >
                        {bookingsExpanded === venue.id ? "Hide" : "View"}{" "}
                        bookings
                      </Button>
                    </div>

                    {/* Expanded bookings */}
                    {bookingsExpanded === venue.id &&
                      venue.bookings &&
                      venue.bookings.length > 0 && (
                        <div
                          id={`bookings-${venue.id}`}
                          className="mt-3 border-t border-(--color-border) pt-3"
                        >
                          <p className="text-xs font-medium text-(--color-muted-foreground) mb-2">
                            Bookings
                          </p>
                          <div className="space-y-2">
                            {venue.bookings.map((booking: Booking) => (
                              <div
                                key={booking.id}
                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs bg-(--color-muted) rounded-(--radius) px-3 py-2 gap-1"
                              >
                                <div className="flex items-center gap-2 font-medium">
                                  <Users className="h-3 w-3 shrink-0" />
                                  <span>
                                    {booking.customer?.name ?? "Guest"}
                                  </span>
                                </div>
                                <span className="text-(--color-muted-foreground) pl-5 sm:pl-0">
                                  {new Date(
                                    booking.dateFrom,
                                  ).toLocaleDateString()}{" "}
                                  →{" "}
                                  {new Date(
                                    booking.dateTo,
                                  ).toLocaleDateString()}
                                </span>
                                <span className="pl-5 sm:pl-0">
                                  {booking.guests} guest(s)
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    {bookingsExpanded === venue.id &&
                      (!venue.bookings || venue.bookings.length === 0) && (
                        <div
                          id={`bookings-${venue.id}`}
                          className="mt-3 border-t border-(--color-border) pt-3"
                        >
                          <p className="text-xs text-(--color-muted-foreground)">
                            No bookings for this venue yet.
                          </p>
                        </div>
                      )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create venue dialog */}
      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create new venue"
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <VenueForm
          onSuccess={handleVenueSuccess}
          onCancel={() => setCreateOpen(false)}
        />
      </Dialog>

      {/* Edit venue dialog */}
      <Dialog
        open={!!editVenue}
        onClose={() => setEditVenue(null)}
        title="Edit venue"
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {editVenue && (
          <VenueForm
            venue={editVenue}
            onSuccess={handleVenueSuccess}
            onCancel={() => setEditVenue(null)}
          />
        )}
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete venue"
      >
        <p className="text-sm text-(--color-muted-foreground) mb-5">
          Are you sure you want to permanently delete this venue? This action
          cannot be undone.
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setDeleteConfirm(null)}
          >
            Keep venue
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={() => deleteConfirm && void handleDelete(deleteConfirm)}
          >
            <Trash2 className="h-4 w-4 mr-1" /> Delete venue
          </Button>
        </div>
      </Dialog>
    </div>
  );
};
