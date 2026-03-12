import {
  Archive,
  CheckCircle,
  LayoutDashboard,
  LayoutGrid,
  Megaphone,
  Plus,
  Settings,
  SquareKanban,
  Zap,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  title: string;
  subtitle: string;
  badge?: string;
  divider?: undefined;
}

export interface NavDivider {
  divider: true;
}

export type NavEntry = NavItem | NavDivider;

export const NAV_ITEMS: NavEntry[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="size-4" />,
    path: "/dashboard",
    title: "Overview & Insights",
    subtitle: "Dashboard",
  },
  {
    id: "campaigns",
    label: "Campaigns",
    icon: <Archive className="size-4" />,
    path: "/campaigns",
    title: "Campaign History & Schedule",
    subtitle: "Campaigns",
    badge: "2",
  },
  { divider: true },
  {
    id: "wizard",
    label: "New Campaign",
    icon: <Plus className="size-4" />,
    path: "/wizard",
    title: "Intent & Data Staging",
    subtitle: "Campaign Wizard",
  },
  {
    id: "studio",
    label: "Campaign Studio",
    icon: <SquareKanban className="size-4" />,
    path: "/studio",
    title: "Creative Layout Editor",
    subtitle: "Campaign Studio",
  },
  {
    id: "approval",
    label: "Approval Queue",
    icon: <CheckCircle className="size-4" />,
    path: "/approval",
    title: "Governance & Review",
    subtitle: "Approval Queue",
  },
  {
    id: "fleet",
    label: "Fleet Execution",
    icon: <Zap className="size-4" />,
    path: "/fleet",
    title: "Live Network Tracking",
    subtitle: "Fleet Execution",
  },
  { divider: true },
  {
    id: "templates",
    label: "Template Manager",
    icon: <LayoutGrid className="size-4" />,
    path: "/templates",
    title: "Manage Layouts & Styles",
    subtitle: "Template Manager",
  },
  {
    id: "admin",
    label: "Brand & Settings",
    icon: <Settings className="size-4" />,
    path: "/admin",
    title: "System Guardrails",
    subtitle: "Admin Config",
  },
];

export const SIDEBAR_HEADER = {
  icon: <Megaphone className="size-[18px] text-ithina-purple" />,
  title: "PROMOTIONS",
  subtitle: "ASSISTANT",
};
