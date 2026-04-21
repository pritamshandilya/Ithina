import {
  Cog,
  LayoutDashboard,
  Megaphone,
  Settings,
  ShieldCheck,
  SquareKanban,
  Store,
  Users,
  Zap,
} from "lucide-react";

import type { Permission, UserRole } from "@/auth/permissions";

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  title: string;
  subtitle: string;
  badge?: number;
  requiredPermission?: Permission;
}

export interface NavSection {
  label: string;
  items: NavItem[];
  requiredRole?: UserRole[];
}

export const MAKER_NAV_SECTIONS: NavSection[] = [
  {
    label: "Overview",
    items: [
      {
        id: "maker-dashboard",
        label: "Dashboard",
        icon: <LayoutDashboard className="size-4" />,
        path: "/maker/dashboard",
        title: "Overview & Insights",
        subtitle: "Dashboard",
        requiredPermission: "dashboard:view",
      },
    ],
  },
  {
    label: "Campaign Workflow",
    items: [
      {
        id: "maker-campaigns",
        label: "All Campaigns",
        icon: <Megaphone className="size-4" />,
        path: "/maker/campaigns",
        title: "Campaigns",
        subtitle: "Campaign Workflow",
        requiredPermission: "campaigns:create",
      },
    ],
  },
  {
    label: "Templates & Branding",
    items: [
      {
        id: "maker-templates",
        label: "Templates",
        icon: <SquareKanban className="size-4" />,
        path: "/maker/templates",
        title: "Template Manager",
        subtitle: "Templates & Branding",
        requiredPermission: "studio:use",
      },
    ],
  },
  {
    label: "Configuration",
    items: [
      {
        id: "maker-guard-rails",
        label: "Guard Rails",
        icon: <Settings className="size-4" />,
        path: "/maker/guard-rails",
        title: "Guard Rails",
        subtitle: "View compliance rules your campaigns must follow. Only admins can add or edit rules.",
        requiredPermission: "dashboard:view",
      },
    ],
  },
];

export const CHECKER_NAV_SECTIONS: NavSection[] = [
  {
    label: "Review",
    items: [
      {
        id: "checker-dashboard",
        label: "Review Dashboard",
        icon: <LayoutDashboard className="size-4" />,
        path: "/checker/dashboard",
        title: "Review Queue Overview",
        subtitle: "Review Dashboard",
        requiredPermission: "dashboard:view",
      },
      {
        id: "approval-review",
        label: "Approval Queue",
        icon: <ShieldCheck className="size-4" />,
        path: "/checker/approvals",
        title: "Governance & Reviews",
        subtitle: "Approval Queue",
        requiredPermission: "approvals:review",
      },
    ],
  },
  {
    label: "Visibility",
    items: [
      {
        id: "campaigns",
        label: "All Campaigns",
        icon: <Megaphone className="size-4" />,
        path: "/checker/campaigns",
        title: "Campaigns",
        subtitle: "Campaign Workflow",
        requiredPermission: "campaigns:view",
      },
      {
        id: "fleet",
        label: "Campaign Tracking",
        icon: <Zap className="size-4" />,
        path: "/checker/fleet",
        title: "Campaign Tracking",
        subtitle: "Campaign Workflow",
        requiredPermission: "fleet:view",
      },
    ],
  },
  {
    label: "Configuration",
    items: [
      {
        id: "checker-guard-rails",
        label: "Guard Rails",
        icon: <Settings className="size-4" />,
        path: "/checker/guard-rails",
        title: "Guard Rails",
        subtitle: "View compliance rules campaigns must follow. Only admins can add or edit rules.",
        requiredPermission: "dashboard:view",
      },
    ],
  },
];

/** Admin at organization scope (no store selected): matches POG sidebar — only these four. */
export const ADMIN_ORG_NAV_SECTIONS: NavSection[] = [
  {
    label: "",
    items: [
      {
        id: "admin-dashboard",
        label: "Dashboard",
        icon: <LayoutDashboard className="size-4" />,
        path: "/admin/dashboard",
        title: "Organization Overview",
        subtitle: "Monitor stores, users, and organization-wide activity.",
        requiredPermission: "dashboard:view",
      },
      {
        id: "stores",
        label: "Stores",
        icon: <Store className="size-4" />,
        path: "/admin/stores",
        title: "Stores",
        subtitle: "Monitor and manage all retail locations in your organization.",
        requiredPermission: "stores:manage",
      },
      {
        id: "users",
        label: "Users",
        icon: <Users className="size-4" />,
        path: "/admin/users",
        title: "Users",
        subtitle: "Manage organization users and role assignments.",
        requiredPermission: "users:manage",
      },
      {
        id: "admin-organization-settings",
        label: "Organization Settings",
        icon: <Settings className="size-4" />,
        path: "/admin/organization-settings",
        title: "Organization Settings",
        subtitle: "View and manage organization-wide information.",
        requiredPermission: "dashboard:view",
      },
    ],
  },
];

/**
 * Admin with a store selected (Team Switcher): campaigns, approvals, fleet, guardrails —
 * scoped to the active store via X-Store-Id / StoreContext.
 */
export const ADMIN_STORE_NAV_SECTIONS: NavSection[] = [
  {
    label: "Operations",
    items: [
      {
        id: "admin-store-ops-dashboard",
        label: "Dashboard",
        icon: <LayoutDashboard className="size-4" />,
        path: "/admin/store-dashboard",
        title: "Overview & Insights",
        subtitle: "Dashboard",
        requiredPermission: "dashboard:view",
      },
      {
        id: "admin-all-campaigns",
        label: "All Campaigns",
        icon: <Megaphone className="size-4" />,
        path: "/admin/campaigns",
        title: "Campaigns",
        subtitle: "Campaign Workflow",
        requiredPermission: "campaigns:view",
      },
      {
        id: "approval-review",
        label: "Approval Queue",
        icon: <ShieldCheck className="size-4" />,
        path: "/admin/approvals",
        title: "Governance & Reviews",
        subtitle: "Approval Queue",
        requiredPermission: "approvals:review",
      },
      {
        id: "fleet",
        label: "Campaign Tracking",
        icon: <Zap className="size-4" />,
        path: "/admin/fleet",
        title: "Campaign Tracking",
        subtitle: "Campaign Workflow",
        requiredPermission: "fleet:view",
      },
    ],
  },
  {
    label: "Configuration",
    items: [
      {
        id: "admin-store-settings",
        label: "Store Settings",
        icon: <Cog className="size-4" />,
        path: "/admin/store-settings",
        title: "Store Settings",
        subtitle: "Store profile, regional defaults, and staff for the selected store.",
        requiredPermission: "store-settings:view",
      },
      {
        id: "admin-settings",
        label: "Guard Rails",
        icon: <Settings className="size-4" />,
        path: "/admin/settings",
        title: "Guard Rails",
        subtitle: "Monitor and manage compliance rules for the selected store.",
        requiredPermission: "admin:settings",
      },
    ],
  },
];

export function getAdminNavSections(adminHasStoreContext: boolean): NavSection[] {
  return adminHasStoreContext ? ADMIN_STORE_NAV_SECTIONS : ADMIN_ORG_NAV_SECTIONS;
}

export function getNavSectionsForRole(role: string): NavSection[] {
  switch (role) {
    case "admin":
      return getAdminNavSections(false);
   case "checker":
      return CHECKER_NAV_SECTIONS;
    case "maker":
    default:
      return MAKER_NAV_SECTIONS;
  }
}

// Legacy export for any existing usages
export const NAV_SECTIONS = MAKER_NAV_SECTIONS;

export interface NavItemFlat {
  id: string;
  label: string;
  path: string;
  title: string;
  subtitle: string;
  crumbSection: string;
  crumbParent: string;
}

function flattenSections(sections: NavSection[], sectionLabel: string): NavItemFlat[] {
  return sections.flatMap((section) =>
    section.items.map((item) => ({
      id: item.id,
      label: item.label,
      path: item.path,
      title: item.title,
      subtitle: item.subtitle,
      crumbSection: sectionLabel,
      crumbParent: section.label || "Organization",
    })),
  );
}

export const NAV_ITEMS_FLAT: NavItemFlat[] = [
  ...flattenSections(MAKER_NAV_SECTIONS, "Maker"),
  ...flattenSections(CHECKER_NAV_SECTIONS, "Checker"),
  ...flattenSections(ADMIN_ORG_NAV_SECTIONS, "Admin"),
  ...flattenSections(ADMIN_STORE_NAV_SECTIONS, "Admin"),
];
