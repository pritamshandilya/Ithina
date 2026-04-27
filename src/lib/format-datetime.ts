/**
 * Display ISO or parseable date strings as DD/MM/YYYY with 12-hour time.
 * Non-parseable strings return unchanged (e.g. mock labels).
 */
export function formatCampaignDateTime(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "—";

  const d = new Date(trimmed);
  if (Number.isNaN(d.getTime())) return trimmed;

  const pad = (n: number) => String(n).padStart(2, "0");
  const day = pad(d.getDate());
  const month = pad(d.getMonth() + 1);
  const year = d.getFullYear();

  let h = d.getHours();
  const ampm = d.getHours() >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  const min = pad(d.getMinutes());

  return `${day}/${month}/${year} ${h}:${min} ${ampm}`;
}

/** "April 13, 2026 at 4:10 PM" for profile and account metadata (local timezone). */
export function formatProfileDateTime(iso: string | null | undefined): string | null {
  if (!iso?.trim()) return null;
  const d = new Date(iso.trim());
  if (Number.isNaN(d.getTime())) return null;
  const datePart = d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const timePart = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${datePart} at ${timePart}`;
}
