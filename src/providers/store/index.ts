import { useContext } from "react";

import { StoreContext } from "./context";

export * from "./provider";
export * from "./types";

export function useStore() {
  const context = useContext(StoreContext);

  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }

  return context;
}

export function useSelectedStoreId(): string | undefined {
  return useStore().selectedStore?.id;
}
