import type { Store } from "@/types/checker";

export interface StoreSetting extends Store {
  region?: string;
  created?: string;
  status?: "Active" | "Inactive";
  currency: string;
  default_dimensions: string;
}
