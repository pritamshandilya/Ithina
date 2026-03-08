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

import { hasPermission } from "@/auth/authorization";
import MainLayout from "@/components/layouts/main";
import { useStore } from "@/providers/store";
import { mockCheckerUser } from "@/lib/api/mock-data";
import { requireAuth } from "@/routes/-guards/requireAuth";
import { cn } from "@/lib/utils";

import { ComplianceRulesTab } from "@/components/checker/knowledge-center/compliance-rules-tab";
import { ReferenceDocumentsTab } from "@/components/checker/knowledge-center/reference-documents-tab";

export const Route = createFileRoute("/checker/knowledge-center/")({
  beforeLoad: ({ context, location }) => {
    const user = requireAuth(context, location);
    if (!hasPermission(user, "knowledge-center:view")) {
      throw redirect({ to: "/forbidden" });
    }
  },
  component: KnowledgeCenterPage,
});

type KnowledgeCenterTab = "rules" | "documents";

function KnowledgeCenterPage() {
  const [activeTab, setActiveTab] = useState<KnowledgeCenterTab>("rules");
  const { selectedStore } = useStore();
  const _selectedStoreId = selectedStore?.id || mockCheckerUser.storeId;
  void _selectedStoreId; // Reserved for notifications

  const tabs: { id: KnowledgeCenterTab; label: string }[] = [
    { id: "rules", label: "Compliance Rules" },
    { id: "documents", label: "Reference Documents" },
  ];

  return (
    <MainLayout>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-primary pt-2 px-2 pb-4 sm:pt-3 sm:px-2 sm:pb-4 lg:pt-4 lg:px-2 lg:pb-5">
        <div className="mx-auto flex w-full max-w-screen-2xl flex-1 min-h-0 flex-col">

          {/* Page Header */}
          <header className="shrink-0 space-y-1">
            <h1 className="text-2xl font-bold text-foreground">Knowledge Center</h1>
            <p className="text-sm text-muted-foreground">
              Define and manage compliance logic used by the AI during audit evaluation
            </p>
          </header>

          {/* Tab Navigation */}
          <nav
            className="mt-3 shrink-0 flex gap-1 rounded-lg border border-border bg-card/50 p-1"
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
          <div
            role="tabpanel"
            aria-labelledby={`tab-${activeTab}`}
            className="mt-3 flex-1 min-h-0 overflow-hidden"
          >
            {activeTab === "rules" && <ComplianceRulesTab />}
            {activeTab === "documents" && <ReferenceDocumentsTab />}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
