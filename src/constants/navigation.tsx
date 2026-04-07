import {
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
];

export const ADMIN_NAV_SECTIONS: NavSection[] = [
  {
    label: "Organization",
    items: [
      {
        id: "admin-dashboard",
        label: "Org Dashboard",
        icon: <LayoutDashboard className="size-4" />,
        path: "/admin/dashboard",
        title: "Organization Overview",
        subtitle: "Org Dashboard",
        requiredPermission: "dashboard:view",
      },
      {
        id: "users",
        label: "User Management",
        icon: <Users className="size-4" />,
        path: "/admin/users",
        title: "Invite, Edit & Remove Users",
        subtitle: "User Management",
        requiredPermission: "users:manage",
      },
      {
        id: "stores",
        label: "Stores",
        icon: <Store className="size-4" />,
        path: "/admin/stores",
        title: "Manage Stores",
        subtitle: "Stores",
        requiredPermission: "stores:manage",
      },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        id: "admin-campaigns",
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
        id: "admin-settings",
        label: "Guard Rails",
        icon: <Settings className="size-4" />,
        path: "/admin/settings",
        title: "System Guardrails",
        subtitle: "Admin Config",
        requiredPermission: "admin:settings",
      },
    ],
  },
];

export function getNavSectionsForRole(role: string): NavSection[] {
  switch (role) {
    case "admin":
      return ADMIN_NAV_SECTIONS;
    case "checker":
      return CHECKER_NAV_SECTIONS;
    case "maker":
    default:
      return MAKER_NAV_SECTIONS;
  }
}

export const SIDEBAR_HEADER = {
  icon: <Megaphone className="size-[18px] text-ithina-purple" />,
  title: "PROMOTIONS",
  subtitle: "ASSISTANT",
};

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
      crumbParent: section.label,
    })),
  );
}

export const NAV_ITEMS_FLAT: NavItemFlat[] = [
  ...flattenSections(MAKER_NAV_SECTIONS, "Maker"),
  ...flattenSections(CHECKER_NAV_SECTIONS, "Checker"),
  ...flattenSections(ADMIN_NAV_SECTIONS, "Admin"),
];
