/**
 * Compliance Report Tabs
 *
 * Tab navigation for full report sections.
 * Overview & Charts, Image Comparison, All Issues, All Items.
 */
import { AlertTriangle, BarChart3, ImageIcon, List } from "lucide-react";

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
  issuesCount?: number;
  itemsCount?: number;
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
  issuesCount,
  itemsCount,
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
        "border-border flex gap-6 overflow-x-auto border-b",
        className,
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
              "relative flex shrink-0 items-center gap-2 pb-4 text-sm font-medium transition-colors",
              isActive
                ? "text-accent"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <tab.icon
              className={cn(
                "size-4",
                isActive ? "text-accent" : "text-muted-foreground",
              )}
              aria-hidden
            />
            {tab.label}
            {tab.id === "issues" && typeof issuesCount === "number"
              ? ` (${issuesCount})`
              : null}
            {tab.id === "items" && typeof itemsCount === "number"
              ? ` (${itemsCount})`
              : null}
            {isActive && (
              <div
                className="bg-accent absolute right-0 bottom-0 left-0 h-0.5 rounded-t-full"
                aria-hidden
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
