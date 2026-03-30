import { useCallback, useEffect, useRef } from "react";

/**
 * Manages setTimeout calls with automatic cleanup on unmount.
 * Replaces the repeated timersRef + useEffect cleanup pattern.
 */
export function useScheduledCallback() {
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => { timers.current.forEach(clearTimeout); };
  }, []);

  return useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
    return id;
  }, []);
}
