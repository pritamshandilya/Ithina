import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import MainLayout from "@/components/layouts/main";
import { HeaderContextBar } from "@/components/maker";
import { useStores } from "@/features/maker/hooks";
import { mockUser } from "@/lib/api/mock-data";

export const Route = createFileRoute("/maker/audits/adhoc")({
  component: AdhocAnalysisPage,
});

function AdhocAnalysisPage() {
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

          <header className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">
              Adhoc Analysis
            </h1>
            <p className="text-sm text-muted-foreground">
              Audit mode content coming soon.
            </p>
          </header>
        </div>
      </div>
    </MainLayout>
  );
}
