import { type ReactNode } from "react";
import { RotateCw } from "lucide-react";
import { Alert } from "./alert";
import { Button } from "./button";

interface ErrorStateProps {
  /** What failed, in the reader's terms — "Couldn't load your venues". */
  title: string;
  /** The API's message where there is one, or a plain fallback. */
  message: string;
  /**
   * Re-runs the fetch. Omit it where retrying cannot help — a 404 is an
   * answer, not a failure, and offering "Try again" there is a dead end.
   */
  onRetry?: () => void;
  isRetrying?: boolean;
  /** Extra actions, rendered beside Try again. */
  children?: ReactNode;
  className?: string;
}

/**
 * The one way this app reports a failed read. It exists because every fetch
 * that failed used to fall through to its own empty state, which told the
 * reader their data did not exist rather than that we could not load it.
 */
export function ErrorState({
  title,
  message,
  onRetry,
  isRetrying,
  children,
  className,
}: ErrorStateProps) {
  return (
    <Alert variant="destructive" title={title} className={className}>
      <p>{message}</p>
      {(onRetry || children) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {onRetry && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRetry}
              isLoading={isRetrying}
            >
              {!isRetrying && (
                <RotateCw className="h-4 w-4" aria-hidden="true" />
              )}
              Try again
            </Button>
          )}
          {children}
        </div>
      )}
    </Alert>
  );
}
