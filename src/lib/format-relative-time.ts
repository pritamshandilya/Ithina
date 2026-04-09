/**
 * Human-readable relative time for last-login style timestamps.
 */
export function formatRelativeTime(iso: string | null): string {
  if (!iso) return "Never";

  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";

  const diffMs = Date.now() - then;
  const diffM = Math.floor(diffMs / 60_000);
  if (diffM < 1) return "Just now";
  if (diffM < 60) return `${diffM} minute${diffM === 1 ? "" : "s"} ago`;

  const diffH = Math.floor(diffM / 60);
  if (diffH < 24) return `${diffH} hour${diffH === 1 ? "" : "s"} ago`;

  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD} day${diffD === 1 ? "" : "s"} ago`;

  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
