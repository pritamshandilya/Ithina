import { createFileRoute } from "@tanstack/react-router";

import PageHeader from "@/components/shared/page-header";

export const Route = createFileRoute("/_authenticated/studio")({
  component: StudioPage,
});

function StudioPage() {
  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "Promotions Assistant" },
          { label: "ESL Studio", isActive: true },
        ]}
        title="Creative Layout Editor"
      />

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6 lg:p-8">
        <div className="rounded-2xl border border-ithina-border bg-ithina-panel/80 p-8 text-sm text-slate-300">
          ESL Studio canvas and layout editor will be implemented here.
        </div>
      </div>
    </>
  );
}

