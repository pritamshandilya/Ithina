import { Loader2 } from "lucide-react";

/**
 * Shown by TanStack Router while a code-split route chunk is loading.
 * Keep this dependency-light so it stays in the main bundle and appears immediately.
 */
export default function RoutePendingFallback() {
  return (
    <div
      className="flex min-h-[240px] flex-1 flex-col items-center justify-center gap-3 bg-ithina-bg py-12"
      role="status"
      aria-live="polite"
      aria-label="Loading page"
    >
      <Loader2 className="size-8 animate-spin text-ithina-purple" aria-hidden />
      <span className="font-mono text-xs text-slate-500">Loading…</span>
    </div>
  );
}
