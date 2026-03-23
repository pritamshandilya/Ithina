import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import { selectSelectedStore } from "@/store/selectors";
import type { StoreContextValue } from "./types";

export * from "./provider";
export * from "./types";


export function useStore(): StoreContextValue {
  const selectedStore = useSelector(selectSelectedStore);
  const dispatch = useDispatch();

  const setSelectedStore = useCallback(
    (store: StoreContextValue["selectedStore"]) => {
      dispatch({ type: "store/setCurrentStore", payload: store });
    },
    [dispatch],
  );

  return {
    selectedStore,
    setSelectedStore,
    isStoreSelected: selectedStore !== null,
  };
}

export function useSelectedStoreId(): string | undefined {
  return useSelector(selectSelectedStore)?.id;
}
