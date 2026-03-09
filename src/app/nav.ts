import type { Permission } from "@/auth/permissions";

export interface NavItemConfig {
  key: string;
  label: string;
  to: string;
  requires?: Permission;
  requiresAny?: readonly Permission[];
}

export const CORE_NAV: readonly NavItemConfig[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    to: "/dashboard",
    requires: "dashboard:view",
  },
  {
    key: "stores",
    label: "Stores",
    to: "/stores",
    requires: "stores:read",
  },
  {
    key: "users",
    label: "Users",
    to: "/users",
    requires: "users:manage",
  },
  {
    key: "approvals",
    label: "Approvals",
    to: "/approvals",
    requiresAny: ["approvals:submit", "approvals:review"],
  },
  {
    key: "knowledge-center",
    label: "Knowledge Center",
    to: "/knowledge-center",
    requires: "knowledge-center:view",
  },
];
