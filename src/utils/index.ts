import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, differenceInDays, isBefore, isWithinInterval } from "date-fns";
import type { Booking } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "…";
}
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "NOK",
    minimumFractionDigits: 0,
  }).format(price);
}
export function buildImageUrl(
  url: string | undefined,
  fallback: string,
): string {
  if (!url) return fallback;
  try {
    new URL(url);
    return url;
  } catch {
    return fallback;
  }
}

export function formatDate(date: string | Date): string {
  return format(
    typeof date === "string" ? fromUTCDateString(date) : date,
    "MMM d, yyyy",
  );
}

export function calculateNights(from: Date, to: Date): number {
  return Math.max(0, differenceInDays(to, from));
}

// Converts a local calendar date (e.g. midnight from a date picker) to an ISO
// string for that same Y/M/D — using `date.toISOString()` directly shifts the
// day backward for any timezone ahead of UTC (Norway included).
export function toUTCDateString(date: Date): string {
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  ).toISOString();
}

// The inverse: a stored booking date is a UTC calendar day. Parsed as-is it
// lands at 01:00/02:00 local time in Norway (or on the previous evening west
// of UTC), which slips it off the local day it names. Rebuilding it from the
// UTC Y/M/D gives local midnight of that same day.
export function fromUTCDateString(iso: string): Date {
  const d = new Date(iso);
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/** A calendar day is unavailable if it is in the past or inside an existing
 *  booking, check-in and check-out days included. `date` and `today` are
 *  local midnights, as the date picker hands them over. */
export function isDayUnavailable(
  date: Date,
  bookings: Pick<Booking, "dateFrom" | "dateTo">[],
  today: Date,
): boolean {
  if (isBefore(date, today)) return true;
  return bookings.some((b) =>
    isWithinInterval(date, {
      start: fromUTCDateString(b.dateFrom),
      end: fromUTCDateString(b.dateTo),
    }),
  );
}

/**
 * Venue descriptions are plain text by contract, but the field accepts
 * anything and hosts paste markup into it. React escapes that, so a stored
 * "<p><strong>Great spot" renders those angle brackets on the page.
 *
 * Tags are stripped for display rather than trusted: this is user-submitted
 * content, so dangerouslySetInnerHTML is not an option here.
 */
export function toPlainText(html: string | null | undefined): string {
  if (!html) return "";
  return (
    html
      // Block-level ends become the paragraph breaks they stood for; the
      // detail page renders with whitespace-pre-line and keeps them.
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|li|h[1-6]|tr)\s*>/gi, "\n")
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/gi, " ")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&quot;/gi, '"')
      .replace(/&#0*39;/gi, "'")
      // Ampersand last, so "&amp;lt;" decodes to "&lt;" and not to "<".
      .replace(/&amp;/gi, "&")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

/* Gradient pairs for venues with no photo. Mid-tone and brand-adjacent, so
   white sits legibly on them and they read as a deliberate empty state in
   either theme rather than as a failed image. */
const PLACEHOLDER_GRADIENTS = [
  ["#0d5c63", "#14868f"], // teal — the brand primary
  ["#b23f0a", "#d4692a"], // ember
  ["#3f3a33", "#6b6157"], // stone
  ["#2f5233", "#4a7c50"], // moss
  ["#4a3b5c", "#6f5a86"], // plum
  ["#1f3a5f", "#3a6491"], // deep blue
] as const;

function hashCode(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * A stand-in image for a venue with no media, as an inline SVG data URI.
 *
 * Most seeded venues have no photo, and a single shared stock URL meant the
 * homepage opened on a grid of the same picture. Keyed off the venue id, each
 * card gets its own gradient and initial instead — no network request, so it
 * cannot itself fail to load.
 */
export function venuePlaceholder(seed: string, label?: string): string {
  const [from, to] = PLACEHOLDER_GRADIENTS[
    hashCode(seed) % PLACEHOLDER_GRADIENTS.length
  ];
  const initial = escapeXml((label?.trim()[0] ?? "?").toUpperCase());
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">' +
    '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
    `<stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/>` +
    '</linearGradient></defs><rect width="600" height="400" fill="url(#g)"/>' +
    '<text x="300" y="200" text-anchor="middle" dominant-baseline="central" ' +
    'font-family="ui-sans-serif, system-ui, sans-serif" font-size="168" ' +
    `font-weight="700" fill="#ffffff" fill-opacity="0.32">${initial}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * A post-login destination taken from the URL. Only same-site paths pass:
 * "//evil.com" and "https://…" are dropped, so the login form can never be
 * turned into an open redirect.
 */
export function toSafeRedirect(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const offSite =
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.startsWith("/\\");
  return offSite ? undefined : value;
}

export const AVATAR_PLACEHOLDER =
  "https://ui-avatars.com/api/?background=0d5c63&color=fff&name=User";

export function getPageNumbers(
  currentPage: number,
  totalPages: number,
): (number | "...")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages: (number | "...")[] = [1];
  if (currentPage > 3) pages.push("...");
  for (
    let i = Math.max(2, currentPage - 1);
    i <= Math.min(totalPages - 1, currentPage + 1);
    i++
  ) {
    pages.push(i);
  }
  if (currentPage < totalPages - 2) pages.push("...");
  pages.push(totalPages);
  return pages;
}
