import { useEffect, useLayoutEffect, useState } from "react";

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
  const [allowPersist, setAllowPersist] = useState(false);

  useLayoutEffect(() => {
    if (typeof window === "undefined") {
      setAllowPersist(true);
      return;
    }
    setAllowPersist(false);
    const raw = window.localStorage.getItem(storageKey);
    if (raw) {
      try {
        setOverrides(JSON.parse(raw) as Record<string, string | null>);
      } catch {
        setOverrides({});
      }
    } else {
      setOverrides({});
    }
    setAllowPersist(true);
  }, [setOverrides, storageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!allowPersist) return;
    window.localStorage.setItem(storageKey, JSON.stringify(overrides));
  }, [allowPersist, storageKey, overrides]);
}
