import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, id, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-[var(--color-foreground)]"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-[var(--radius)] border border-[var(--color-input)]",
          "bg-[var(--color-background)] px-3 py-2 text-sm",
          "ring-offset-[var(--color-background)] placeholder:text-[var(--color-muted-foreground)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-[var(--color-destructive)]",
          className,
        )}
        {...props}
      />
      {error && (
        <p className="text-xs text-[var(--color-destructive)]">{error}</p>
      )}
    </div>
  ),
);
Input.displayName = "Input";
