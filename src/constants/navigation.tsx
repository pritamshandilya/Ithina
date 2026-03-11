import {
  CheckCircle,
  LayoutDashboard,
  Megaphone,
  Settings,
  SquareKanban,
  Wand2,
  Zap,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  title: string;
  subtitle: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    label: "Assistant Dashboard",
    icon: <LayoutDashboard className="size-4" />,
    path: "/dashboard",
    title: "Overview & Insights",
    subtitle: "Assistant Dashboard",
  },
  {
    id: "wizard",
    label: "Campaign Wizard",
    icon: <Wand2 className="size-4" />,
    path: "/wizard",
    title: "Intent & Data Staging",
    subtitle: "Campaign Wizard",
  },
  {
    id: "studio",
    label: "ESL Studio",
    icon: <SquareKanban className="size-4" />,
    path: "/studio",
    title: "Creative Layout Editor",
    subtitle: "ESL Studio",
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
  {
    id: "admin",
    label: "Brand Profile Settings",
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
