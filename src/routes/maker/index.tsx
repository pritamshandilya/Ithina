import { createFileRoute } from "@tanstack/react-router";

import {
  AssignedShelvesList,
  HeaderContextBar,
  PrimaryActionSection,
  QuickStatsPanel,
  ReturnedAuditsSection,
} from "@/components/maker";

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
 * 4. Returned Audits Section - Audits requiring resubmission (conditional)
 * 5. Assigned Shelves List - All assigned shelves with filtering
 * 
 * Access at: /maker
 */
export const Route = createFileRoute("/maker/")({
  component: MakerDashboard,
});

function MakerDashboard() {
  return (
    <div className="min-h-screen bg-primary p-4 sm:p-6 lg:p-8">
      {/* Main container with max width for readability */}
      <div className="mx-auto max-w-7xl space-y-6">
        {/* 1. Header Context Bar */}
        <HeaderContextBar />

        {/* 2. Primary Action Section */}
        <PrimaryActionSection />

        {/* 3. Quick Stats Panel */}
        <QuickStatsPanel />

        {/* 4. Returned Audits Section (conditional - only shows if audits exist) */}
        <ReturnedAuditsSection
          onResubmit={(auditId, shelfId) => {
            // TODO: Navigate to audit edit page when implemented
            console.log("Re-submit requested:", { auditId, shelfId });
            // Future: navigate({ to: '/maker/audit/$id/edit', params: { id: auditId }})
          }}
        />

        {/* 5. Assigned Shelves List */}
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
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
  );
}
