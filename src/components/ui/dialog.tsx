import { type ReactNode } from "react";
import { cn } from "@/utils";
import { X } from "lucide-react";
import { Button } from "./button";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  className,
}: DialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "dialog-title" : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <div
        className={cn(
          "relative z-10 w-full max-w-lg rounded-(--radius) border border-(--color-border)",
          "bg-(--color-background) p-6 shadow-xl mx-4",
          className,
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-3 top-3"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </Button>
        {title && (
          <h2 id="dialog-title" className="text-lg font-semibold mb-1">
            {title}
          </h2>
        )}
        {description && (
          <p className="text-sm text-(--color-muted-foreground) mb-4">
            {description}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}
