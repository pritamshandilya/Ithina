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
 * - Rule Versions (version history)
 * - Reference Documents (policy grounding)
 */

import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";

import MainLayout from "@/components/layouts/main";
import { useStore } from "@/providers/store";
import { SimulatedAuthService } from "@/lib/auth/simulated-auth";
import { mockCheckerUser } from "@/lib/api/mock-data";
import { cn } from "@/lib/utils";

import { ComplianceRulesTab } from "@/components/checker/knowledge-center/compliance-rules-tab";
import { ReferenceDocumentsTab } from "@/components/checker/knowledge-center/reference-documents-tab";
import { RuleVersionsTab } from "@/components/checker/knowledge-center/rule-versions-tab";

export const Route = createFileRoute("/checker/knowledge-center")({
  beforeLoad: () => {
    const user = SimulatedAuthService.getCurrentUser();
    if (!user || user.role !== "checker" || !SimulatedAuthService.isAuthenticated()) {
      throw redirect({ to: "/checker/dashboard" });
    }
  },
  component: KnowledgeCenterPage,
});

type KnowledgeCenterTab = "rules" | "versions" | "documents";

function KnowledgeCenterPage() {
  const [activeTab, setActiveTab] = useState<KnowledgeCenterTab>("rules");
  const { selectedStore } = useStore();
  const _selectedStoreId = selectedStore?.id || mockCheckerUser.storeId;
  void _selectedStoreId; // Reserved for notifications

  const tabs: { id: KnowledgeCenterTab; label: string }[] = [
    { id: "rules", label: "Compliance Rules" },
    { id: "versions", label: "Rule Versions" },
    { id: "documents", label: "Reference Documents" },
  ];

  return (
    <MainLayout>
        <div className="min-h-screen bg-primary pt-2 px-2 pb-4 sm:pt-3 sm:px-2 sm:pb-4 lg:pt-4 lg:px-2 lg:pb-5">
        <div className="mx-auto w-full max-w-screen-2xl space-y-4">

          {/* Page Header */}
          <header className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">Knowledge Center</h1>
            <p className="text-sm text-muted-foreground">
              Define and manage compliance logic used by the AI during audit evaluation
            </p>
          </header>

          {/* Tab Navigation */}
          <nav
            className="flex gap-1 rounded-lg border border-border bg-card/50 p-1"
            aria-label="Knowledge Center sections"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "rounded-md px-4 py-2 text-sm font-medium transition-colors",
                  activeTab === tab.id
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
                aria-selected={activeTab === tab.id}
                role="tab"
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Tab Content */}
          <div role="tabpanel" aria-labelledby={`tab-${activeTab}`}>
            {activeTab === "rules" && <ComplianceRulesTab />}
            {activeTab === "versions" && <RuleVersionsTab />}
            {activeTab === "documents" && <ReferenceDocumentsTab />}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
