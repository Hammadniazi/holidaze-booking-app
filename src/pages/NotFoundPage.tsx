import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 text-center">
      {/* Decorative icon */}
      <div
        className="flex h-20 w-20 items-center justify-center rounded-full bg-(--color-primary)/10 mb-6"
        aria-hidden="true"
      >
        <MapPin className="h-10 w-10 text-(--color-primary)" />
      </div>

      {/* Headline */}
      <h1 className="text-6xl sm:text-8xl font-extrabold text-(--color-primary) mb-2 tracking-tight">
        404
      </h1>
      <h2 className="text-2xl sm:text-3xl font-bold text-(--color-foreground) mb-3">
        Page not found
      </h2>
      <p className="text-(--color-muted-foreground) max-w-sm mb-8 text-base sm:text-lg leading-relaxed">
        Looks like this destination doesn't exist. It may have been moved,
        deleted, or you might have mistyped the URL.
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button asChild size="lg">
          <Link to="/">Browse venues</Link>
        </Button>
        <Button variant="outline" size="lg" asChild>
          <Link to="/contact">Contact support</Link>
        </Button>
      </div>
    </div>
  );
}

export default NotFoundPage;
