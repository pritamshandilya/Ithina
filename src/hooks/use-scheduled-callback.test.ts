import { act, renderHook } from "@testing-library/react";

import { useScheduledCallback } from "./use-scheduled-callback";

describe("useScheduledCallback", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should schedule callbacks", () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useScheduledCallback());

    act(() => {
      result.current(callback, 1000);
      jest.advanceTimersByTime(1000);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("should clear pending callbacks on unmount", () => {
    const callback = jest.fn();
    const { result, unmount } = renderHook(() => useScheduledCallback());

    act(() => {
      result.current(callback, 1000);
    });

    unmount();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(callback).not.toHaveBeenCalled();
  });
});
