import { createFileRoute } from "@tanstack/react-router";

import PageHeader from "@/components/shared/page-header";

export const Route = createFileRoute("/_authenticated/approval")({
  component: ApprovalPage,
});

function ApprovalPage() {
  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "Promotions Assistant" },
          { label: "Approval Queue", isActive: true },
        ]}
        title="Governance & Review"
      />

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6 lg:p-8">
        <div className="rounded-2xl border border-ithina-border bg-ithina-panel/80 p-8 text-sm text-slate-300">
          Approval queue timeline and decision workspace will go here.
        </div>
      </div>
    </>
  );
}

