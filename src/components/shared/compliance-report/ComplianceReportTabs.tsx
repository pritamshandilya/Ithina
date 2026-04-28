/**
 * Compliance Report Tabs
 *
 * Tab navigation for full report sections.
 * Overview & Charts, Image Comparison, All Issues, All Items.
 */

import {
  BarChart3,
  ImageIcon,
  AlertTriangle,
  List,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ReportTabId = "overview" | "image-comparison" | "issues" | "items";

export interface ReportTabDef {
  id: ReportTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
}

export interface ComplianceReportTabsProps {
  activeTab: ReportTabId;
  onTabChange: (tab: ReportTabId) => void;
  /** Optional custom label for image tab */
  imageTabLabel?: string;
  className?: string;
}

const TABS: ReportTabDef[] = [
  { id: "overview", label: "Overview & Charts", icon: BarChart3 },
  { id: "image-comparison", label: "Image Comparison", icon: ImageIcon },
  { id: "issues", label: "All Issues", icon: AlertTriangle },
  { id: "items", label: "All Items", icon: List },
];

export function ComplianceReportTabs({
  activeTab,
  onTabChange,
  imageTabLabel,
  className,
}: ComplianceReportTabsProps) {
  const tabs = TABS.map((tab) =>
    tab.id === "image-comparison" && imageTabLabel
      ? { ...tab, label: imageTabLabel }
      : tab,
  );

  return (
    <div
      className={cn(
        "flex border-b border-border gap-6 overflow-x-auto",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center gap-2 pb-4 text-sm font-medium transition-colors relative shrink-0",
              isActive
                ? "text-accent"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon
              className={cn(
                "size-4",
                isActive ? "text-accent" : "text-muted-foreground"
              )}
              aria-hidden
            />
            {tab.label}
            {isActive && (
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-t-full"
                aria-hidden
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
