import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import {
  AssignedShelvesList,
  HeaderContextBar,
  PrimaryActionSection,
  QuickStatsPanel,
  ReturnedAuditsSection,
  DraftAuditsSection,
} from "@/components/maker";
import MainLayout from "@/components/layouts/main";
import { useStores } from "@/features/maker/hooks";
import { mockUser } from "@/lib/api/mock-data";

/**
 * Maker Dashboard Route
 * 
 * Main dashboard for store workers (makers) to manage shelf audits.
 * This is a task-oriented, operational dashboard focused on daily execution
 * rather than analytics or reporting.
 * 
 * Layout Structure:
 * 1. Header Context Bar - User, store, date, sync status
 * 2. Primary Action Section - Start New Shelf Audit CTA
 * 3. Quick Stats Panel - Today's metrics at a glance
 * 4. Draft Audits Section - In-progress audits (conditional)
 * 5. Returned Audits Section - Audits requiring resubmission (conditional)
 * 6. Assigned Shelves List - All assigned shelves with filtering
 * 
 * Access at: /maker
 */
export const Route = createFileRoute("/maker/")({
  component: MakerDashboard,
});

function MakerDashboard() {
  const navigate = useNavigate();
  const { data: stores } = useStores();
  const [selectedStoreId, setSelectedStoreId] = useState(
    () => mockUser.storeId
  );

  /**
   * Handler for starting a new audit
   * Navigates to the audit mode selection screen
   */
  const handleStartAudit = () => {
    navigate({ to: "/maker/audit/new" });
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-primary p-4 sm:p-6 lg:p-8">
        {/* Main container with max width for readability */}
        <div className="mx-auto max-w-7xl space-y-6">
        {/* 1. Header Context Bar */}
        <HeaderContextBar
          stores={stores ?? []}
          selectedStoreId={selectedStoreId}
          onStoreChange={setSelectedStoreId}
        />

        {/* 2. Primary Action Section */}
        <PrimaryActionSection onClick={handleStartAudit} />

        {/* 3. Quick Stats Panel */}
        <QuickStatsPanel />

        {/* 4-5. My Audits section */}
        <section aria-labelledby="my-audits-heading" className="space-y-4">
          <div>
            <h2 id="my-audits-heading" className="text-2xl font-bold text-foreground">
              My Audits
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Continue draft audits and resolve returned submissions
            </p>
          </div>

          <DraftAuditsSection
            onResume={(auditId, shelfId) => {
              // TODO: Navigate to audit editor with draft data when implemented
              console.log("Resume draft requested:", { auditId, shelfId });
              // Future: navigate({ to: '/maker/audit/$id/edit', params: { id: auditId }})
            }}
          />

          <ReturnedAuditsSection
            onViewReport={(auditId, shelfId) => {
              // TODO: Navigate to detailed feedback report page when implemented
              console.log("View report requested:", { auditId, shelfId });
              // Future: navigate({ to: '/maker/report/$id', params: { id: auditId }})
            }}
          />
        </section>

        {/* 6. Assigned Shelves List */}
        <div className="space-y-4" aria-labelledby="assigned-shelves-heading">
          <div>
            <h2 id="assigned-shelves-heading" className="text-2xl font-bold text-foreground">
              Assigned Shelves
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              View and manage your shelf audit assignments
            </p>
          </div>

          <AssignedShelvesList
            onShelfClick={(shelfId) => {
              // TODO: Navigate to shelf detail page when implemented
              console.log("Shelf clicked:", shelfId);
              // Future: navigate({ to: '/maker/shelf/$id', params: { id: shelfId }})
            }}
          />
        </div>
        </div>
      </div>
    </MainLayout>
  );
}
