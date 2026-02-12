import type { PropsWithChildren } from "react";
import { useEffect, useMemo, useState } from "react";

import { StoreContext } from "./context";
import type { Store } from "./types";

const STORE_KEY = "selected_store";

export function StoreProvider({ children }: PropsWithChildren) {
  const [selectedStore, setSelectedStoreState] = useState<Store | null>(() => {
    const stored = localStorage.getItem(STORE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    if (selectedStore) {
      localStorage.setItem(STORE_KEY, JSON.stringify(selectedStore));
    } else {
      localStorage.removeItem(STORE_KEY);
    }
  }, [selectedStore]);

  const setSelectedStore = (store: Store | null) => {
    setSelectedStoreState(store);
  };

  const contextValue = useMemo(
    () => ({
      selectedStore,
      setSelectedStore,
      isStoreSelected: selectedStore !== null,
    }),
    [selectedStore],
  );

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
}
