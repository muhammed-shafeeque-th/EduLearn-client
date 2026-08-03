/**
 * Lightweight route transition fallback (no framer-motion, no full-screen takeover).
 */
export function RouteFallback() {
  return (
    <div
      className="flex min-h-[40vh] flex-1 items-center justify-center"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}
