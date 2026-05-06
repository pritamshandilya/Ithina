import { createFileRoute } from "@tanstack/react-router";

import MainLayout from "@/components/layouts/main";
import { PlanogramMakerPage } from "@/components/planogram/PlanogramMakerPage";
import { PageHeader } from "@/components/shared/PageHeader";

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
          description="Analyze store Display Units against approved planogram arrangements."
        />
      }
    >
      <PlanogramMakerPage />
    </MainLayout>
  );
}
