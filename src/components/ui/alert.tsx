import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/utils";
import { AlertCircle, CheckCircle2, Info, XCircle } from "lucide-react";

interface AlertProps {
  variant?: "default" | "success" | "warning" | "destructive";
  title?: string;
  children: ReactNode;
  className?: string;
  /**
   * Moves keyboard focus here when the alert appears. For an error raised by
   * a submit: role="alert" announces it, but focus stays on the button the
   * user just pressed, which may now be scrolled out of view.
   */
  focusOnMount?: boolean;
}

const configs = {
  default: {
    wrapper: "border-(--color-border) bg-(--color-muted)",
    icon: Info,
    iconClass: "text-(--color-muted-foreground)",
  },
  success: {
    wrapper: "border-(--color-success)/35 bg-(--color-success)/10",
    icon: CheckCircle2,
    iconClass: "text-(--color-success)",
  },
  warning: {
    wrapper: "border-(--color-warning)/35 bg-(--color-warning)/10",
    icon: AlertCircle,
    iconClass: "text-(--color-warning)",
  },
  destructive: {
    wrapper: "border-(--color-destructive)/35 bg-(--color-destructive)/10",
    icon: XCircle,
    iconClass: "text-(--color-destructive)",
  },
};

export function Alert({
  variant = "default",
  title,
  children,
  className,
  focusOnMount = false,
}: AlertProps) {
  const config = configs[variant];
  const Icon = config.icon;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (focusOnMount) ref.current?.focus();
  }, [focusOnMount]);

  return (
    <div
      ref={ref}
      role="alert"
      tabIndex={focusOnMount ? -1 : undefined}
      className={cn(
        focusOnMount &&
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-ring)",
        "flex gap-3 rounded-(--radius) border p-4",
        config.wrapper,
        className,
      )}
    >
      <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", config.iconClass)} />
      <div className="flex-1">
        {title && <p className="font-medium text-sm mb-1">{title}</p>}
        <div className="text-sm text-(--color-foreground)/85">
          {children}
        </div>
      </div>
    </div>
  );
}
