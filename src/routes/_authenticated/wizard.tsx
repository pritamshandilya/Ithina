import { createFileRoute } from "@tanstack/react-router";

import PageHeader from "@/components/shared/page-header";

export const Route = createFileRoute("/_authenticated/wizard")({
  component: WizardPage,
});

function WizardPage() {
  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "Promotions Assistant" },
          { label: "Campaign Wizard", isActive: true },
        ]}
        title="Intent & Data Staging"
      />

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6 lg:p-8">
        <div className="rounded-2xl border border-ithina-border bg-ithina-panel/80 p-8 text-sm text-slate-300">
          Campaign Wizard workspace will live here (intent chat + ROOS
          constraints), matching the Vue prototype.
        </div>
      </div>
    </>
  );
}

