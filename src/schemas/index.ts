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
        url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
        alt: z.string().max(120).optional().or(z.literal("")),
      })
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
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

export type BookingInput = z.infer<typeof bookingSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
