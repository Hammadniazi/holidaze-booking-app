import { type ReactNode } from "react";
import { cn } from "@/utils";
import { AlertCircle, CheckCircle2, Info, XCircle } from "lucide-react";

interface AlertProps {
  variant?: "default" | "success" | "warning" | "destructive";
  title?: string;
  children: ReactNode;
  className?: string;
}

const configs = {
  default: {
    wrapper: "border-[var(--color-border)] bg-[var(--color-background)]",
    icon: Info,
    iconClass: "text-[var(--color-muted-foreground)]",
  },
  success: {
    wrapper:
      "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950",
    icon: CheckCircle2,
    iconClass: "text-green-600 dark:text-green-400",
  },
  warning: {
    wrapper:
      "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950",
    icon: AlertCircle,
    iconClass: "text-yellow-600 dark:text-yellow-400",
  },
  destructive: {
    wrapper:
      "border-[var(--color-destructive)]/30 bg-[var(--color-destructive)]/10",
    icon: XCircle,
    iconClass: "text-[var(--color-destructive)]",
  },
};

export function Alert({
  variant = "default",
  title,
  children,
  className,
}: AlertProps) {
  const config = configs[variant];
  const Icon = config.icon;

  return (
    <div
      role="alert"
      className={cn(
        "flex gap-3 rounded-(--radius) border p-4",
        config.wrapper,
        className,
      )}
    >
      <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", config.iconClass)} />
      <div className="flex-1">
        {title && <p className="font-medium text-sm mb-1">{title}</p>}
        <div className="text-sm text-(--color-muted-foreground)">
          {children}
        </div>
      </div>
    </div>
  );
}
