import { createContext } from "react";

import type { StoreContextValue } from "./types";

export const defaultStoreContext: StoreContextValue = {
  selectedStore: null,
  setSelectedStore: () => {},
  isStoreSelected: false,
};

export const StoreContext =
  createContext<StoreContextValue>(defaultStoreContext);
