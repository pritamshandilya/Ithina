export interface Store {
  id: string;
  name: string;
  address: string;
  pendingAuditCount?: number;
  region?: string;
  created?: string;
  status?: "Active" | "Inactive";
}

export interface StoreContextValue {
  selectedStore: Store | null;
  setSelectedStore: (store: Store | null) => void;
  isStoreSelected: boolean;
}
