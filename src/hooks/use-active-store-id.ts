import { useSyncExternalStore } from "react";

import { StoreContext } from "@/lib/store-context";

/** Current `X-Store-Id` scope (null = organization / no store selected). */
export function useActiveStoreId(): string | null {
  return useSyncExternalStore(
    StoreContext.subscribe,
    () => StoreContext.getStoreId(),
    () => null,
  );
}
