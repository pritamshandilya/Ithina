export interface Store {
  id: string;
  name: string;
  code: string;
  city: string;
  region: string;
  country: string;
}

export interface StoreContextValue {
  selectedStore: Store | null;
  setSelectedStore: (store: Store | null) => void;
  isStoreSelected: boolean;
}
