import type { PropsWithChildren } from "react";
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import { StoreContext } from "./context";
import type { Store } from "./types";
import { selectSelectedStore } from "@/store/selectors";

export function StoreProvider({ children }: PropsWithChildren) {
  const selectedStore = useSelector(selectSelectedStore);
  const dispatch = useDispatch();

  const setSelectedStore = useMemo(
    () => (store: Store | null) => {
      dispatch({ type: "store/setCurrentStore", payload: store });
    },
    [dispatch],
  );

  const contextValue = useMemo(
    () => ({
      selectedStore,
      setSelectedStore,
      isStoreSelected: selectedStore !== null,
    }),
    [selectedStore, setSelectedStore],
  );

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
}
