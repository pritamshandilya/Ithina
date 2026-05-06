/** Helpers for `<input type="datetime-local" />` ↔ API ISO strings (local timezone). */

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

function pad2(n: number): string {
  return `${n}`.padStart(2, "0");
}

/**
 * Parse backend `scheduled_time` (`09:00 AM`, `9:00`, `14:30`) to `HH:mm` for datetime-local.
 */
export function parseScheduledTimeToHm(raw: string | null | undefined): string | null {
  const s = raw?.trim();
  if (!s) return null;
  const m12 = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)\s*$/i);
  if (m12) {
    let h = parseInt(m12[1], 10);
    const min = m12[2];
    const ap = m12[3].toUpperCase();
    if (ap === "PM" && h !== 12) h += 12;
    if (ap === "AM" && h === 12) h = 0;
    if (h < 0 || h > 23 || !/^\d{2}$/.test(min)) return null;
    return `${pad2(h)}:${min}`;
  }
  const m24 = s.match(/^(\d{1,2}):(\d{2})$/);
  if (m24) {
    const h = parseInt(m24[1], 10);
    const min = m24[2];
    if (h < 0 || h > 23 || !/^\d{2}$/.test(min)) return null;
    return `${pad2(h)}:${min}`;
  }
  return null;
}

/**
 * Draft API may return `YYYY-MM-DD` only. `Date` parses that as UTC midnight, which
 * shifts the calendar day in many local timezones. Expand to local interpretable
 * datetimes: start-of-day / end-of-day for end dates.
 *
 * For **start** date-only values, optional `scheduledTime` from `campaign_meta.scheduled_time`
 * sets the clock (e.g. `09:00 AM` → `T09:00:00`); otherwise start-of-day `T00:00:00`.
 */
export function normalizeDraftScheduleForParsing(
  value: string | null | undefined,
  role: "start" | "end",
  scheduledTime?: string | null,
): string | null {
  const v = value?.trim();
  if (!v) return null;
  if (DATE_ONLY.test(v)) {
    if (role === "end") {
      return `${v}T23:59:00`;
    }
    const hm = parseScheduledTimeToHm(scheduledTime ?? undefined);
    if (hm) {
      return `${v}T${hm}:00`;
    }
    return `${v}T00:00:00`;
  }
  return v;
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

const WEEKDAY_TO_NUM: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

/** Local wall time as `YYYY-MM-DDTHH:mm:ss` (no `Z`; parsed consistently with draft ISOs in the app). */
function formatLocalDateTimeIso(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}:00`;
}

function parseClock12(hour: number, minute: number, meridiem: string): { h: number; m: number } | null {
  if (minute < 0 || minute > 59 || hour < 1 || hour > 12) return null;
  const ap = meridiem.toUpperCase();
  let h = hour;
  if (ap === "PM" && h !== 12) h += 12;
  if (ap === "AM" && h === 12) h = 0;
  return { h, m: minute };
}

/**
 * Next occurrence of `weekdayName` at local hour/minute after `from` (strictly greater timestamp).
 */
export function nextWeekdayWallIso(
  weekdayName: string,
  hour: number,
  minute: number,
  from: Date = new Date(),
): string | null {
  const target = WEEKDAY_TO_NUM[weekdayName.toLowerCase()];
  if (target === undefined) return null;

  for (let i = 0; i < 14; i++) {
    const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i, hour, minute, 0, 0);
    if (d.getDay() !== target) continue;
    if (d.getTime() > from.getTime()) return formatLocalDateTimeIso(d);
  }
  return null;
}

/** Sunday 23:59 local on the same weekend as `start` when start is Fri–Sun; otherwise next Sunday end. */
function sundayEndOfWeekendFrom(start: Date): Date {
  const d = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0, 0);
  const dow = start.getDay();
  let add = 0;
  if (dow === 5) add = 2;
  else if (dow === 6) add = 1;
  else if (dow === 0) add = 0;
  else {
    add = (7 - dow) % 7;
    if (add === 0) add = 7;
  }
  d.setDate(d.getDate() + add);
  d.setHours(23, 59, 0, 0);
  return d;
}

/**
 * Best-effort schedule ISOs from NL assistant prose (no year in strings — uses `from` as “today”).
 * Strips trailing **Other suggestions** so list bullets don’t confuse parsing.
 */
export function parseNlScheduleRangeFromAssistantMessage(
  message: string,
  from: Date = new Date(),
): { scheduleStartIso: string | null; scheduleEndIso: string | null } {
  const norm = message.replace(/\r\n/g, "\n");
  const splitIdx = norm.search(/\n\n\s*\*{0,2}\s*Other\s+suggestions\b/i);
  const lead = splitIdx === -1 ? norm : norm.slice(0, splitIdx);

  let scheduleStartIso: string | null = null;
  let scheduleEndIso: string | null = null;

  const wm = lead.match(
    /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s+at\s+(\d{1,2}):(\d{2})\s*(AM|PM)\b/i,
  );
  if (wm) {
    const clock = parseClock12(parseInt(wm[2], 10), parseInt(wm[3], 10), wm[4]);
    if (clock) {
      scheduleStartIso = nextWeekdayWallIso(wm[1], clock.h, clock.m, from);
    }
  }

  if (/\bthis\s+weekend\b/i.test(lead)) {
    if (scheduleStartIso) {
      const s = new Date(scheduleStartIso.trim());
      if (!Number.isNaN(s.getTime())) {
        scheduleEndIso = formatLocalDateTimeIso(sundayEndOfWeekendFrom(s));
      }
    } else {
      const fri = nextWeekdayWallIso("friday", 0, 0, from);
      if (fri) {
        const friD = new Date(fri.trim());
        if (!Number.isNaN(friD.getTime())) {
          scheduleStartIso = fri;
          scheduleEndIso = formatLocalDateTimeIso(sundayEndOfWeekendFrom(friD));
        }
      }
    }
  }

  return { scheduleStartIso, scheduleEndIso };
}

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
