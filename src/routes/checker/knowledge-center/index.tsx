/**
 * Knowledge Center Route
 *
 * Governance brain of the system. Defines and manages compliance logic
 * used by the AI during audit evaluation.
 *
 * Access: Checker (Store Manager) role only.
 * Makers must not see or access this route.
 *
 * Sub-sections:
 * - Compliance Rules (catalog + rule builder)
 * - Reference Documents (policy grounding)
 */
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";

import { ComplianceRulesTab } from "@/components/checker/knowledgeCenter/ComplianceRulesTab";
import { ReferenceDocumentsTab } from "@/components/checker/knowledgeCenter/ReferenceDocumentsTab";
import MainLayout from "@/components/layouts/main";
import { PageHeader } from "@/components/shared/PageHeader";
import { mockCheckerUser } from "@/lib/api/mockData";
import { hasPermission } from "@/lib/auth/authorization";
import { cn } from "@/lib/utils";
import { useStore } from "@/providers/store";
import { requireAuth } from "@/routes/-guards/requireAuth";
import type { BeforeLoadArgs } from "@/routes/__root";

export const Route = createFileRoute("/checker/knowledge-center/")({
  beforeLoad: ({ context, location }: BeforeLoadArgs) => {
    const user = requireAuth(context, location);
    if (!hasPermission(user, "knowledge-center:view")) {
      throw redirect({ to: "/forbidden" });
    }
  },
  component: KnowledgeCenterPage,
});

type KnowledgeCenterTab = "rules" | "documents";

export function KnowledgeCenterPage() {
  const [activeTab, setActiveTab] = useState<KnowledgeCenterTab>("rules");
  const { selectedStore } = useStore();
  const _selectedStoreId = selectedStore?.id || mockCheckerUser.storeId;
  void _selectedStoreId; // Reserved for notifications

  const tabs: { id: KnowledgeCenterTab; label: string }[] = [
    { id: "rules", label: "Compliance Rules" },
    { id: "documents", label: "Reference Documents" },
  ];

  return (
    <MainLayout
      pageHeader={
        <PageHeader
          title="Knowledge Center"
          description="Access training materials, guides, and compliance standards."
        />
      }
    >
      <div className="bg-primary flex min-h-0 flex-1 flex-col overflow-hidden px-2 pt-2 pb-4 sm:px-2 sm:pt-3 sm:pb-4 lg:px-2 lg:pt-4 lg:pb-5">
        <div className="mx-auto flex min-h-0 w-full max-w-screen-2xl flex-1 flex-col">
          {/* Tab Navigation */}
          <nav
            className="border-border bg-muted/30 flex w-fit flex-wrap items-center gap-1 rounded-xl border p-1"
            aria-label="Knowledge Center sections"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
                  activeTab === tab.id
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
                aria-selected={activeTab === tab.id}
                role="tab"
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Tab Content */}
          <div
            role="tabpanel"
            aria-labelledby={`tab-${activeTab}`}
            className="mt-3 min-h-0 flex-1 overflow-hidden"
          >
            {activeTab === "rules" && <ComplianceRulesTab />}
            {activeTab === "documents" && <ReferenceDocumentsTab />}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
