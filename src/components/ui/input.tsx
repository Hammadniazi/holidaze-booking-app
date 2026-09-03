import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/utils";

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
          className="text-sm font-medium text-(--color-foreground)"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        aria-invalid={error ? true : undefined}
        aria-describedby={error && id ? `${id}-error` : undefined}
        className={cn(
          "flex h-11 w-full rounded-(--radius) border border-(--color-input)",
          "bg-(--color-card) px-3.5 py-2 text-base sm:text-sm",
          "ring-offset-(--color-background) placeholder:text-(--color-muted-foreground)",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-ring)",
          "disabled:cursor-not-allowed disabled:bg-(--color-muted) disabled:text-(--color-muted-foreground)",
          error && "border-(--color-destructive)",
          className,
        )}
        {...props}
      />
      {error && (
        <p id={id ? `${id}-error` : undefined} role="alert" className="text-xs text-(--color-destructive)">
          {error}
        </p>
      )}
    </div>
  ),
);
Input.displayName = "Input";
