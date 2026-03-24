export interface Store {
  id: string;
  name: string;
  address?: string;
  region?: string;
  status?: "Active" | "Inactive";
  pendingAuditCount?: number;
  created?: string;
  maker_ids?: string[];
  user_ids?: string[];
  currency?: string;
  default_dimensions?: string;
  default_compliance_rule_set_id?: string | null;
  is_active?: boolean;
  code?: string;
  city?: string;
  country?: string;
}

export interface StoreContextValue {
  selectedStore: Store | null;
  setSelectedStore: (store: Store | null) => void;
  isStoreSelected: boolean;
}
