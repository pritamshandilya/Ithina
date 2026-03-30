import {
  Archive,
  Building2,
  CheckCircle,
  LayoutDashboard,
  LayoutGrid,
  Plus,
  Shield,
  SquareKanban,
  Zap,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  /** Page title shown in the content header */
  title: string;
  /** Breadcrumb section label (e.g. "Campaign Workflow") */
  crumbSection: string;
  /** Breadcrumb leaf label — the highlighted last segment */
  crumbParent: string;
  badge?: string;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

/**
 * Sidebar navigation sections — mirrors the prototype navSections exactly.
 * Wizard (/wizard) and Studio (/studio) are NOT sidebar items; they are
 * accessed via the header "New Campaign" CTA and campaign actions.
 */
export const NAV_SECTIONS: NavSection[] = [
  {
    label: "Overview",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: <LayoutDashboard className="size-4" />,
        path: "/dashboard",
        title: "Dashboard",
        crumbSection: "Overview",
        crumbParent: "Dashboard",
      },
    ],
  },
  {
    label: "Campaign Workflow",
    items: [
      {
        id: "campaigns",
        label: "All Campaigns",
        icon: <Archive className="size-4" />,
        path: "/campaigns",
        title: "Campaigns",
        crumbSection: "Campaign Workflow",
        crumbParent: "All Campaigns",
        badge: "2",
      },
      {
        id: "approval",
        label: "Approval Queue",
        icon: <CheckCircle className="size-4" />,
        path: "/approval",
        title: "Approval Queue",
        crumbSection: "Campaign Workflow",
        crumbParent: "Approval Queue",
        badge: "3",
      },
      {
        id: "fleet",
        label: "Fleet Execution",
        icon: <Zap className="size-4" />,
        path: "/fleet",
        title: "Fleet Execution",
        crumbSection: "Campaign Workflow",
        crumbParent: "Fleet Execution",
      },
    ],
  },
  {
    label: "Templates & Branding",
    items: [
      {
        id: "templates",
        label: "Templates",
        icon: <LayoutGrid className="size-4" />,
        path: "/templates",
        title: "Template Manager",
        crumbSection: "Templates & Branding",
        crumbParent: "Templates",
      },
      {
        id: "admin",
        label: "Guard Rails",
        icon: <Shield className="size-4" />,
        path: "/admin",
        title: "Guard Rails",
        crumbSection: "Templates & Branding",
        crumbParent: "Guard Rails",
      },
      {
        id: "store-settings",
        label: "Store Settings",
        icon: <Building2 className="size-4" />,
        path: "/store-settings",
        title: "Store Settings",
        crumbSection: "Templates & Branding",
        crumbParent: "Store Settings",
      },
    ],
  },
];

/**
 * Flat list for breadcrumb lookups.
 * Includes wizard + studio even though they are not sidebar nav items,
 * so ContentHeader can derive their breadcrumb/title metadata.
 */
export const NAV_ITEMS_FLAT: NavItem[] = [
  ...NAV_SECTIONS.flatMap((s) => s.items),
  {
    id: "wizard",
    label: "New Campaign",
    icon: <Plus className="size-4" />,
    path: "/wizard",
    title: "New Campaign",
    crumbSection: "Campaign Workflow",
    crumbParent: "New Campaign",
  },
  {
    id: "studio",
    label: "Campaign Studio",
    icon: <SquareKanban className="size-4" />,
    path: "/studio",
    title: "Campaign Studio",
    crumbSection: "Campaign Workflow",
    crumbParent: "Campaign Studio",
  },
];
