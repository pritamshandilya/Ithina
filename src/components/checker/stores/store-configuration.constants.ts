import type { ElementType } from "react";
import { Store as StoreIcon, Users } from "lucide-react";

import type { StoreConfigurationTab } from "./store-configuration.types";

export const STORE_CONFIGURATION_TABS: Array<{
  id: StoreConfigurationTab;
  label: string;
  icon: ElementType;
}> = [
  { id: "profile", label: "Store Profile", icon: StoreIcon },
  { id: "team", label: "Staff", icon: Users },
];
