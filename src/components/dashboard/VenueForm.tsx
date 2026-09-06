import { venuesApi, ApiError } from "@/api/client";
import { createVenueSchema, type CreateVenueInput } from "@/schemas";
import type { ApiResponse, Venue } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useFieldArray, useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { Alert } from "../ui/alert";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Plus, Star, Trash2 } from "lucide-react";

interface VenueFormProps {
  venue?: Venue;
  onSuccess: (venue: Venue) => void;
  onCancel: () => void;
}

export const VenueForm = ({ venue, onSuccess, onCancel }: VenueFormProps) => {
  const [serverError, setServerError] = useState<string | null>(null);
  const isEditing = !!venue;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateVenueInput>({
    resolver: zodResolver(createVenueSchema) as never,
    defaultValues: venue
      ? {
          name: venue.name,
          description: venue.description,
          price: venue.price,
          maxGuests: venue.maxGuests,
          rating: venue.rating,
          media: venue.media,
          meta: venue.meta,
          location: {
            address: venue.location.address ?? "",
            city: venue.location.city ?? "",
            zip: venue.location.zip ?? "",
            country: venue.location.country ?? "",
            lat: venue.location.lat,
            lng: venue.location.lng,
          },
        }
      : {
          meta: { wifi: false, parking: false, breakfast: false, pets: false },
          media: [],
          location: {},
        },
  });

  const {
    fields: mediaFields,
    append: addMedia,
    remove: removeMedia,
  } = useFieldArray({
    control,
    name: "media",
  });

  const onSubmit = async (rawData: unknown) => {
    const data = rawData as CreateVenueInput;
    setServerError(null);
    try {
      const payload = {
        ...data,
        media: data.media?.filter((m) => m.url) ?? [],
        location: {
          address: data.location.address || null,
          city: data.location.city || null,
          zip: data.location.zip || null,
          country: data.location.country || null,
          continent: data.location.continent || null,
          lat: data.location.lat ?? null,
          lng: data.location.lng ?? null,
        },
      };

      const res = isEditing
        ? ((await venuesApi.update(venue.id, payload)) as ApiResponse<Venue>)
        : ((await venuesApi.create(payload)) as ApiResponse<Venue>);

      toast.success(isEditing ? "Venue updated!" : "Venue created!");
      onSuccess(res.data);
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Failed to save venue";
      setServerError(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {serverError && <Alert variant="destructive">{serverError}</Alert>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          id="name"
          label="Venue name *"
          placeholder="Beautiful Beachfront Villa"
          error={errors.name?.message}
          className="sm:col-span-2"
          {...register("name")}
        />
        <Input
          id="price"
          label="Price per night (NOK) *"
          type="number"
          min={0}
          step={0.01}
          error={errors.price?.message}
          {...register("price")}
        />
        <Input
          id="maxGuests"
          label="Max guests *"
          type="number"
          min={1}
          error={errors.maxGuests?.message}
          {...register("maxGuests")}
        />
      </div>

      {/* Rating */}
      <div>
        <p className="text-sm font-medium mb-2">Venue rating</p>
        <Controller
          name="rating"
          control={control}
          render={({ field }) => (
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() =>
                    field.onChange(star === field.value ? 0 : star)
                  }
                  className="p-0.5 focus:outline-none"
                  aria-label={`${star} star${star > 1 ? "s" : ""}`}
                >
                  <Star
                    className={`h-6 w-6 transition-colors ${
                      (field.value ?? 0) >= star
                        ? "fill-(--color-primary) text-(--color-primary)"
                        : "text-(--color-muted-foreground)"
                    }`}
                  />
                </button>
              ))}
              {field.value ? (
                <span className="ml-2 text-sm text-(--color-muted-foreground)">
                  {field.value} / 5
                </span>
              ) : null}
            </div>
          )}
        />
        {errors.rating && (
          <p className="text-sm text-(--color-destructive) mt-1">
            {errors.rating.message}
          </p>
        )}
      </div>

      <Textarea
        id="description"
        label="Description *"
        placeholder="Describe your venue..."
        rows={4}
        error={errors.description?.message}
        {...register("description")}
      />

      {/* Media */}
      <div>
        <div className="flex items-center justify-between mb-2">
          {/* Not a <label>: this names the whole list, not one control. */}
          <p className="text-sm font-medium">
            Images{" "}
            <span className="text-(--color-muted-foreground) font-normal">
              ({mediaFields.length} / 5)
            </span>
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={mediaFields.length >= 5}
            onClick={() => addMedia({ url: "", alt: "" })}
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Add image
          </Button>
        </div>
        {errors.media?.message && (
          <p className="text-sm text-(--color-destructive) mb-2">
            {errors.media.message}
          </p>
        )}
        {mediaFields.map((field, i) => (
          <div key={field.id} className="flex gap-2 mb-2">
            {/* Repeated rows carry their name via aria-label rather than a
                visible one — five stacked "Image URL / Alt text" pairs would
                be noise. The id is what wires each error to its own field. */}
            <Input
              id={`media-${i}-url`}
              aria-label={`Image ${i + 1} URL`}
              placeholder="https://example.com/image.jpg"
              error={errors.media?.[i]?.url?.message}
              className="flex-1"
              {...register(`media.${i}.url`)}
            />
            <Input
              id={`media-${i}-alt`}
              aria-label={`Image ${i + 1} alt text`}
              placeholder="Alt text"
              className="w-36"
              {...register(`media.${i}.alt`)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-(--color-destructive) shrink-0"
              onClick={() => removeMedia(i)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Amenities */}
      <div>
        <p className="text-sm font-medium mb-2">Amenities</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(["wifi", "parking", "breakfast", "pets"] as const).map(
            (amenity) => (
              <label
                key={amenity}
                className="flex items-center gap-2 text-sm cursor-pointer"
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded accent-(--color-primary)"
                  {...register(`meta.${amenity}`)}
                />
                {amenity.charAt(0).toUpperCase() + amenity.slice(1)}
              </label>
            ),
          )}
        </div>
      </div>

      {/* Location */}
      <div>
        <p className="text-sm font-medium mb-2">Location (optional)</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            id="location-address"
            label="Address"
            autoComplete="off"
            {...register("location.address")}
          />
          <Input
            id="location-city"
            label="City"
            autoComplete="off"
            {...register("location.city")}
          />
          <Input
            id="location-country"
            label="Country"
            autoComplete="off"
            {...register("location.country")}
          />
          <Input
            id="location-zip"
            label="ZIP code"
            autoComplete="off"
            {...register("location.zip")}
          />
        </div>
        <div className="mt-3">
          <p className="text-xs text-(--color-muted-foreground) mb-2">
            Latitude / longitude — optional. Pins the exact spot on the map
            instead of just the city.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              id="location-lat"
              label="Latitude"
              placeholder="e.g. 59.9139"
              type="number"
              step="any"
              error={errors.location?.lat?.message}
              {...register("location.lat", {
                setValueAs: (v) => (v === "" ? undefined : Number(v)),
              })}
            />
            <Input
              id="location-lng"
              label="Longitude"
              placeholder="e.g. 10.7522"
              type="number"
              step="any"
              error={errors.location?.lng?.message}
              {...register("location.lng", {
                setValueAs: (v) => (v === "" ? undefined : Number(v)),
              })}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit" className="flex-1" isLoading={isSubmitting}>
          {isSubmitting
            ? isEditing
              ? "Updating..."
              : "Creating..."
            : isEditing
              ? "Update venue"
              : "Create venue"}
        </Button>
      </div>
    </form>
  );
};
