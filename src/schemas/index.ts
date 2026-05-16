import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
});
//  Registe Schema

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(3, { message: "Name must be at least 3 characters long" })
      .regex(/^[a-zA-Z0-9_]+$/, {
        message: "Name can only contain letters, numbers, and underscores",
      }),
    email: z
      .string()
      .email({ message: "Invalid email address" })
      .regex(/@stud\.noroff\.no$/, {
        message: "Email must be a stud.noroff.no address",
      }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" }),
    confirmPassword: z.string().min(8, {
      message: "Confirm Password must be at least 8 characters long",
    }),
    bio: z
      .string()
      .max(160, { message: "Bio must be under 160 characters" })
      .optional()
      .or(z.literal("")),
    venueManager: z.boolean().default(false),
    avatar: z
      .object({
        url: z
          .string()
          .url({ message: "Must be a valid URL" })
          .optional()
          .or(z.literal("")),
        alt: z.string().max(120).optional().or(z.literal("")),
      })
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
// Venue Schema
export const createVenueSchema = z.object({
  name: z.string().min(1, "Venue name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().min(0, "Price must be positive"),
  maxGuests: z.coerce.number().int().min(1, "Must allow at least 1 guest"),
  rating: z.coerce.number().min(0).max(5).optional(),
  media: z
    .array(
      z.object({
        url: z.string().url("Must be a valid URL"),
        alt: z.string().optional().default(""),
      }),
    )
    .optional()
    .default([]),
  meta: z.object({
    wifi: z.boolean().default(false),
    parking: z.boolean().default(false),
    breakfast: z.boolean().default(false),
    pets: z.boolean().default(false),
  }),
  location: z.object({
    address: z.string().optional().or(z.literal("")),
    city: z.string().optional().or(z.literal("")),
    zip: z.string().optional().or(z.literal("")),
    country: z.string().optional().or(z.literal("")),
    continent: z.string().optional().or(z.literal("")),
    lat: z.coerce.number().optional(),
    lng: z.coerce.number().optional(),
  }),
});
export const bookingSchema = z.object({
  dateFrom: z.string(),
  dateTo: z.string(),
  guests: z.coerce
    .number()
    .int()
    .min(1, { message: " At least 1 guest is required" }),
  venueId: z.string(),
});

export const editBookingSchema = z.object({
  dateFrom: z.string().min(1, { message: "Check-in date is required" }),
  dateTo: z.string().min(1, { message: "Check-out date is required" }),
  guests: z.coerce
    .number()
    .int()
    .min(1, { message: "At least 1 guest is required" }),
});
// Update Profile Schema
export const updateProfileSchema = z.object({
  bio: z
    .string()
    .max(160, { message: "Bio must be under 160 characters" })
    .optional()
    .or(z.literal("")),
  venueManager: z.boolean().optional(),
  avatar: z
    .object({
      url: z
        .string()
        .url({ message: "Must be a valid URL" })
        .optional()
        .or(z.literal("")),
      alt: z
        .string()
        .max(120, { message: "Alt text must be under 120 characters" })
        .optional()
        .or(z.literal("")),
    })
    .optional(),
  banner: z
    .object({
      url: z
        .string()
        .url({ message: "Must be a valid URL" })
        .optional()
        .or(z.literal("")),
      alt: z
        .string()
        .max(120, { message: "Alt text must be under 120 characters" })
        .optional()
        .or(z.literal("")),
    })
    .optional(),
});

export const contactSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.enum(["general", "booking", "hosting", "report"], {
    error: () => "Please select a subject",
  }),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(1000, "Message must be under 1000 characters"),
});

export type BookingInput = z.infer<typeof bookingSchema>;
export type EditBookingInput = z.infer<typeof editBookingSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateVenueInput = z.infer<typeof createVenueSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
