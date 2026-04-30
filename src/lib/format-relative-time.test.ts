import { formatRelativeTime } from "./format-relative-time";

describe("formatRelativeTime", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-04-29T12:00:00Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should render never and invalid values", () => {
    expect(formatRelativeTime(null)).toBe("Never");
    expect(formatRelativeTime("not-a-date")).toBe("—");
  });

  it("should render recent relative time buckets", () => {
    expect(formatRelativeTime("2026-04-29T11:59:45Z")).toBe("Just now");
    expect(formatRelativeTime("2026-04-29T11:45:00Z")).toBe("15 minutes ago");
    expect(formatRelativeTime("2026-04-29T09:00:00Z")).toBe("3 hours ago");
    expect(formatRelativeTime("2026-04-27T12:00:00Z")).toBe("2 days ago");
  });
});
