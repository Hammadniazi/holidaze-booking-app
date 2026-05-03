import { type HTMLAttributes } from "react";
import { cn } from "@/utils";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success";
}

const variants: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-(--color-primary) text-(--color-primary-foreground)",
  secondary: "bg-(--color-secondary) text-(--color-secondary-foreground)",
  destructive: "bg-(--color-destructive) text-(--color-destructive-foreground)",
  outline: "border border-(--color-border) text-(--color-foreground)",
  success: "bg-(--color-success) text-(--color-success-foreground)",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        "transition-colors focus:outline-none focus:ring-2 focus:ring-(--color-ring)",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
