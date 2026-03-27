import { createFileRoute } from "@tanstack/react-router";

import MainLayout from "@/components/layouts/main";
import { PageHeader } from "@/components/shared/page-header";
import { PlanogramMakerPage } from "@/features/planogram/PlanogramMakerPage";

export const Route = createFileRoute("/maker/audits/planogram/")({
  component: PlanogramAnalysisPage,
  meta: {
    layoutMode: "stickyTable",
  },
});

function PlanogramAnalysisPage() {
  return (
    <MainLayout
      pageHeader={
        <PageHeader
          title="Planogram Based Analysis"
          description="Analyze store shelves against approved planogram arrangements."
        />
      }
    >
      <PlanogramMakerPage />
    </MainLayout>
  );
}
