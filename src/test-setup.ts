import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

/** Shared tests use jest.fn(); Vitest exposes vi — minimal shim so both runners work */
const g = globalThis as unknown as { jest?: { fn: typeof vi.fn } };
if (!g.jest?.fn) {
  g.jest = { fn: vi.fn };
}

/** jsdom lacks ResizeObserver; Radix Tooltip / popper and custom hooks expect it */
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver =
  globalThis.ResizeObserver ?? (ResizeObserverMock as unknown as typeof ResizeObserver);

afterEach(() => {
  cleanup();
});
