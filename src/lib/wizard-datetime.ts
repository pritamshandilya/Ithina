/** Helpers for `<input type="datetime-local" />` ↔ API ISO strings (local timezone). */

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Draft API may return `YYYY-MM-DD` only. `Date` parses that as UTC midnight, which
 * shifts the calendar day in many local timezones. Expand to local interpretable
 * datetimes: start-of-day / end-of-day for end dates.
 */
export function normalizeDraftScheduleForParsing(
  value: string | null | undefined,
  role: "start" | "end",
): string | null {
  const v = value?.trim();
  if (!v) return null;
  if (DATE_ONLY.test(v)) {
    return role === "end" ? `${v}T23:59:00` : `${v}T00:00:00`;
  }
  return v;
}

function pad2(n: number): string {
  return `${n}`.padStart(2, "0");
}

export function isoToDatetimeLocalValue(iso: string): string {
  const d = new Date(iso.trim());
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  const h = pad2(d.getHours());
  const min = pad2(d.getMinutes());
  return `${y}-${m}-${day}T${h}:${min}`;
}

export function datetimeLocalValueToParts(local: string): { date: string; time: string } | null {
  const v = local.trim();
  if (!v.includes("T")) return null;
  const [date, timePart] = v.split("T");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const time = (timePart ?? "08:00").slice(0, 5);
  if (!/^\d{2}:\d{2}$/.test(time)) return null;
  return { date, time };
}

/** "Apr 17, 2026" style single date for summary cards. */
export function formatIsoDateUsShort(iso: string | null | undefined): string | null {
  if (!iso?.trim()) return null;
  const d = new Date(iso.trim());
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** "Oct 15 – Oct 20" style range for agent schedule hints (local calendar dates). */
export function formatIsoRangeUsShort(startIso: string | null | undefined, endIso: string | null | undefined): string | null {
  if (!startIso?.trim()) return null;
  const s = new Date(startIso.trim());
  if (Number.isNaN(s.getTime())) return null;
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const left = s.toLocaleDateString("en-US", opts);
  if (!endIso?.trim()) return left;
  const e = new Date(endIso.trim());
  if (Number.isNaN(e.getTime())) return left;
  const right = e.toLocaleDateString("en-US", opts);
  return `${left} – ${right}`;
}
