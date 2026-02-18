import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import MainLayout from "@/components/layouts/main";
import {
  AssignedShelvesList,
  HeaderContextBar,
  MyAuditsSection,
  PrimaryActionSection,
  QuickStatsPanel,
} from "@/components/maker";
import { useStores } from "@/features/maker/hooks";
import { mockUser } from "@/lib/api/mock-data";

export const Route = createFileRoute("/maker/dashboard")({
  component: MakerDashboard,
});

function MakerDashboard() {
  const navigate = useNavigate();
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

          <PrimaryActionSection />
          <QuickStatsPanel />

          <section aria-labelledby="my-audits-heading" className="space-y-4">
            <div>
              <h2 id="my-audits-heading" className="text-2xl font-bold text-foreground">
                My Audits
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Continue draft audits and resolve returned submissions
              </p>
            </div>

            <MyAuditsSection
              onResume={(_auditId, _shelfId) => {
                navigate({ to: "/maker/audits/planogram" });
              }}
              onViewReport={(_auditId, _shelfId) => {
                navigate({ to: "/maker/audits/planogram" });
              }}
            />
          </section>

          <div className="space-y-4" aria-labelledby="assigned-shelves-heading">
            <div>
              <h2 id="assigned-shelves-heading" className="text-2xl font-bold text-foreground">
                Assigned Shelves
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                View and manage your shelf audit assignments
              </p>
            </div>

            <AssignedShelvesList
              onShelfClick={(shelfId) => {
                console.log("Shelf clicked:", shelfId);
              }}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
