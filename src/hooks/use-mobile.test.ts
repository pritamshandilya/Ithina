import { renderHook } from "@testing-library/react";

import { useIsMobile } from "./use-mobile";

describe("useIsMobile", () => {
  it("should return true below the mobile breakpoint", () => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 767 });

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
  });

  it("should return false at desktop widths", () => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 1024 });

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
  });
});
