import {
  datetimeLocalValueToParts,
  formatIsoDateUsShort,
  formatIsoRangeUsShort,
  normalizeDraftScheduleForParsing,
  parseScheduledTimeToHm,
} from "./wizard-datetime";

describe("wizard-datetime", () => {
  it("should parse 12-hour and 24-hour scheduled times", () => {
    expect(parseScheduledTimeToHm("09:30 AM")).toBe("09:30");
    expect(parseScheduledTimeToHm("12:00 AM")).toBe("00:00");
    expect(parseScheduledTimeToHm("2:15 PM")).toBe("14:15");
    expect(parseScheduledTimeToHm("18:45")).toBe("18:45");
    expect(parseScheduledTimeToHm("bad")).toBeNull();
  });

  it("should normalize date-only draft schedules without UTC day shifting", () => {
    expect(normalizeDraftScheduleForParsing("2026-04-29", "start", "09:00 AM")).toBe("2026-04-29T09:00:00");
    expect(normalizeDraftScheduleForParsing("2026-04-29", "end")).toBe("2026-04-29T23:59:00");
  });

  it("should split datetime-local values into date and time parts", () => {
    expect(datetimeLocalValueToParts("2026-04-29T08:30")).toEqual({ date: "2026-04-29", time: "08:30" });
    expect(datetimeLocalValueToParts("2026-04-29")).toBeNull();
  });

  it("should format ISO dates for display", () => {
    expect(formatIsoDateUsShort("2026-04-29T12:00:00")).toMatch(/Apr .*2026/);
    expect(formatIsoRangeUsShort("2026-04-29T12:00:00", "2026-05-02T12:00:00")).toMatch(/Apr .* – May/);
  });
});
