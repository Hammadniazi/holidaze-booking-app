import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, differenceInDays } from "date-fns";

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
  return format(new Date(date), "MMM d, yyyy");
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

export const VENUE_PLACEHOLDER =
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop";
export const AVATAR_PLACEHOLDER =
  "https://ui-avatars.com/api/?background=3b82f6&color=fff&name=User";

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
