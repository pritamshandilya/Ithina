
import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import MainLayout from "@/components/layouts/main";
import { ManualOverrideList, HeaderContextBar } from "@/components/maker";
import { useStores } from "@/features/maker/hooks";
import { mockUser } from "@/lib/api/mock-data";

export const Route = createFileRoute("/maker/manual-audits")({
  component: MakerManualAuditsPage,
});

function MakerManualAuditsPage() {
  const { data: stores } = useStores();
  const [selectedStoreId, setSelectedStoreId] = useState(() => mockUser.storeId);

  return (
    <MainLayout>
      <div className="min-h-screen bg-primary p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <HeaderContextBar
            stores={stores ?? []}
            selectedStoreId={selectedStoreId}
            onStoreChange={setSelectedStoreId}
          />

          {/* Header Bar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-border bg-card p-4 shadow-sm">
            <header className="space-y-1">
              <h1 className="text-2xl font-bold text-foreground">Approvals</h1>
              <p className="text-sm text-muted-foreground">
                Track the approval status of your submitted audits
              </p>
            </header>
          </div>

          <div className="rounded-lg border border-border bg-card shadow-sm p-6">
            <ManualOverrideList 
                onAction={(id, action) => {
                    console.log("Action on audit:", id, action);
                    // Add navigation logic if needed, e.g. to fix issues
                }} 
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
