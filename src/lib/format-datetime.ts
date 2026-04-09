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
