import { useEffect } from "react";

interface UsePersistedFixturePlanogramOverridesParams {
  storageKey: string;
  overrides: Record<string, string | null>;
  setOverrides: (value: Record<string, string | null>) => void;
}

export function usePersistedFixturePlanogramOverrides({
  storageKey,
  overrides,
  setOverrides,
}: UsePersistedFixturePlanogramOverridesParams) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as Record<string, string | null>;
      setOverrides(parsed);
    } catch {
      setOverrides({});
    }
  }, [setOverrides, storageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(storageKey, JSON.stringify(overrides));
  }, [storageKey, overrides]);
}
