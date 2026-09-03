import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/utils";

/**
 * The single page frame. Every page — and the navbar and footer — uses this so
 * the content edge never moves between routes.
 *
 * Previously pages set their own widths (7xl on the venue list, 5xl on venue
 * detail and contact, 4xl on profile and dashboard) while the navbar and footer
 * were locked to 7xl, so the content edge jumped up to ~200px on navigation
 * while the logo stayed put.
 *
 * To shorten a reading measure, constrain the *text block* inside the
 * container — never the frame itself.
 */
export const Container = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}
    {...props}
  />
));
Container.displayName = "Container";
