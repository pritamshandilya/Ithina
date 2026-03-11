import { createFileRoute } from "@tanstack/react-router";

import PageHeader from "@/components/shared/page-header";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
});

function AdminPage() {
  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "Promotions Assistant" },
          { label: "Admin Config", isActive: true },
        ]}
        title="System Guardrails"
      />

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6 lg:p-8">
        <div className="rounded-2xl border border-ithina-border bg-ithina-panel/80 p-8 text-sm text-slate-300">
          Brand profile, JSON guardrails, and compliance configuration from the
          prototype will be wired here.
        </div>
      </div>
    </>
  );
}

