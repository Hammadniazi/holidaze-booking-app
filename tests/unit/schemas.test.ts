import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema, createVenueSchema } from "@/schemas/index";

// ---------------------------------------------------------------------------
// loginSchema
// ---------------------------------------------------------------------------
describe("loginSchema", () => {
  it("passes with valid email and password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("fails when email is not a valid address", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("fails when password is shorter than 8 characters", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });

  it("fails when email is missing", () => {
    const result = loginSchema.safeParse({ password: "password123" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// registerSchema
// ---------------------------------------------------------------------------
describe("registerSchema", () => {
  const validData = {
    name: "testuser",
    email: "user@stud.noroff.no",
    password: "password123",
    confirmPassword: "password123",
    venueManager: false,
  };

  it("passes with valid noroff student email", () => {
    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("fails when email is not a stud.noroff.no address", () => {
    const result = registerSchema.safeParse({
      ...validData,
      email: "user@gmail.com",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const emails = result.error.issues.map((i) => i.path[0]);
      expect(emails).toContain("email");
    }
  });

  it("fails when passwords do not match", () => {
    const result = registerSchema.safeParse({
      ...validData,
      confirmPassword: "different_password",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path[0]);
      expect(paths).toContain("confirmPassword");
    }
  });

  it("fails when name contains spaces", () => {
    const result = registerSchema.safeParse({
      ...validData,
      name: "test user",
    });
    expect(result.success).toBe(false);
  });

  it("fails when name contains special characters other than underscore", () => {
    const result = registerSchema.safeParse({
      ...validData,
      name: "test-user!",
    });
    expect(result.success).toBe(false);
  });

  it("fails when name is shorter than 3 characters", () => {
    const result = registerSchema.safeParse({ ...validData, name: "ab" });
    expect(result.success).toBe(false);
  });

  it("passes when name contains only letters, numbers, and underscores", () => {
    const result = registerSchema.safeParse({ ...validData, name: "test_123" });
    expect(result.success).toBe(true);
  });

  it("fails when bio exceeds 160 characters", () => {
    const result = registerSchema.safeParse({
      ...validData,
      bio: "a".repeat(161),
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createVenueSchema
// ---------------------------------------------------------------------------
describe("createVenueSchema", () => {
  const validVenue = {
    name: "Ocean View Suite",
    description: "A beautiful venue by the sea",
    price: 150,
    maxGuests: 4,
    meta: {
      wifi: true,
      parking: false,
      breakfast: false,
      pets: false,
    },
    location: {
      address: "",
      city: "Oslo",
      zip: "",
      country: "Norway",
      continent: "",
    },
  };

  it("passes with valid venue data", () => {
    const result = createVenueSchema.safeParse(validVenue);
    expect(result.success).toBe(true);
  });

  it("fails when name is empty", () => {
    const result = createVenueSchema.safeParse({ ...validVenue, name: "" });
    expect(result.success).toBe(false);
  });

  it("fails when description is empty", () => {
    const result = createVenueSchema.safeParse({
      ...validVenue,
      description: "",
    });
    expect(result.success).toBe(false);
  });

  it("fails when price is negative", () => {
    const result = createVenueSchema.safeParse({ ...validVenue, price: -1 });
    expect(result.success).toBe(false);
  });

  it("passes when price is 0 (free venue)", () => {
    const result = createVenueSchema.safeParse({ ...validVenue, price: 0 });
    expect(result.success).toBe(true);
  });

  it("fails when maxGuests is 0", () => {
    const result = createVenueSchema.safeParse({ ...validVenue, maxGuests: 0 });
    expect(result.success).toBe(false);
  });

  it("fails when maxGuests is negative", () => {
    const result = createVenueSchema.safeParse({
      ...validVenue,
      maxGuests: -2,
    });
    expect(result.success).toBe(false);
  });

  it("fails when a media item has an invalid URL", () => {
    const result = createVenueSchema.safeParse({
      ...validVenue,
      media: [{ url: "not-a-url", alt: "photo" }],
    });
    expect(result.success).toBe(false);
  });

  it("passes with a valid media item", () => {
    const result = createVenueSchema.safeParse({
      ...validVenue,
      media: [{ url: "https://example.com/image.jpg", alt: "photo" }],
    });
    expect(result.success).toBe(true);
  });
});
