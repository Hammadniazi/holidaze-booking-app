import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/utils";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
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
      <textarea
        id={id}
        ref={ref}
        aria-invalid={error ? true : undefined}
        aria-describedby={error && id ? `${id}-error` : undefined}
        className={cn(
          "flex min-h-20 w-full rounded-(--radius) border border-(--color-input)",
          "bg-(--color-background) px-3 py-2 text-sm",
          "placeholder:text-(--color-muted-foreground) focus-visible:outline-none",
          "focus-visible:ring-2 focus-visible:ring-(--color-ring)",
          "disabled:cursor-not-allowed disabled:opacity-50",
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
Textarea.displayName = "Textarea";
