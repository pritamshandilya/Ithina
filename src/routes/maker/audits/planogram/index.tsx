import { createFileRoute } from "@tanstack/react-router";

import MainLayout from "@/components/layouts/main";
import { PageHeader } from "@/components/shared/page-header";
import { PlanogramMakerPage } from "@/features/planogram/PlanogramMakerPage";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";

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
        >
          <Button
            asChild
            variant="success"
            className="shrink-0"
          >
            <Link
              to="/maker/audits/planogram/new"
              search={{ shelfId: undefined }}
            >
              <Plus className="size-4" aria-hidden />
              Add Shelf
            </Link>
          </Button>
        </PageHeader>
      }
    >
      <PlanogramMakerPage />
    </MainLayout>
  );
}
