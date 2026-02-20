export interface Store {
  id: string;
  name: string;
  address?: string;
  code?: string;
  city?: string;
  region?: string;
  country?: string;
  pendingAuditCount?: number;
  created?: string;
  status?: "Active" | "Inactive";
}

export interface StoreContextValue {
  selectedStore: Store | null;
  setSelectedStore: (store: Store | null) => void;
  isStoreSelected: boolean;
}
