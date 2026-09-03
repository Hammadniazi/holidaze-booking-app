import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "accent";
  size?: "default" | "sm" | "lg" | "icon";
  isLoading?: boolean;
  asChild?: boolean;
}

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  default:
    "bg-(--color-primary) text-(--color-primary-foreground) hover:bg-(--color-primary)/90",
  destructive:
    "bg-(--color-destructive) text-(--color-destructive-foreground) hover:bg-(--color-destructive)/90",
  outline:
    "border border-(--color-input) bg-transparent hover:bg-(--color-accent) hover:text-(--color-accent-foreground)",
  secondary:
    "bg-(--color-secondary) text-(--color-secondary-foreground) hover:bg-(--color-secondary)/80",
  ghost:
    "hover:bg-(--color-accent) hover:text-(--color-accent-foreground)",
  link: "text-(--color-primary) underline-offset-4 hover:underline",
  // Ember. Reserved for the primary commercial action (Confirm Booking,
  // Search) so exactly one thing on any given screen is warm.
  accent:
    "bg-(--color-accent-brand) text-(--color-accent-brand-foreground) hover:brightness-110 shadow-[var(--elev-1)]",
};

// Heights meet the 44px touch minimum at `default` and above. `sm` is 40px and
// is for dense desktop toolbars only — not for primary mobile actions.
const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
  default: "h-11 px-5 py-2",
  sm: "h-10 rounded-(--radius) px-3.5 text-xs",
  lg: "h-12 rounded-(--radius) px-8 text-base",
  icon: "h-11 w-11",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      isLoading,
      children,
      disabled,
      asChild = false,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-(--radius) text-sm font-medium",
          "ring-offset-(--color-background)",
          "transition-[background-color,color,box-shadow,filter] duration-(--motion-fast) ease-(--ease-out)",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-ring) focus-visible:ring-offset-2",
          // Disabled gets its own muted pair rather than bleeding a tinted fill
          // through opacity — opacity-50 on a colour fill reads as a rendering
          // fault, not as a control waiting on input.
          "disabled:cursor-not-allowed disabled:bg-(--color-muted) disabled:text-(--color-muted-foreground)",
          "disabled:border-transparent disabled:shadow-none disabled:hover:brightness-100",
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {isLoading && (
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            )}
            {children}
          </>
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";
