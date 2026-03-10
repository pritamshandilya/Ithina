import { createFileRoute } from "@tanstack/react-router";

import PageHeader from "@/components/shared/page-header";

export const Route = createFileRoute("/_authenticated/fleet")({
  component: FleetPage,
});

function FleetPage() {
  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "Promotions Assistant" },
          { label: "Fleet Execution", isActive: true },
        ]}
        title="Live Network Tracking"
      />

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6 lg:p-8">
        <div className="rounded-2xl border border-ithina-border bg-ithina-panel/80 p-8 text-sm text-slate-300">
          Fleet execution map, device health, and rollout progress view will be
          implemented here.
        </div>
      </div>
    </>
  );
}

