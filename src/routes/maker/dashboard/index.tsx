import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

import MainLayout from "@/components/layouts/main";
import {
  MakerAccomplishedCards,
  MakerAssignedTable,
  MakerAttentionSection,
  MakerPerformanceCharts,
  MyAuditsSection,
} from "@/components/maker";
import { MakerDashboardHeader } from "@/components/maker/MakerDashboardHeader";
import { PageHeader } from "@/components/shared/PageHeader";
import { useDraftAudits, useReturnedAudits } from "@/queries/maker";

export const Route = createFileRoute("/maker/dashboard/")({
  component: MakerDashboard,
});

function MakerDashboard() {
  const navigate = useNavigate();
  const { data: returned = [] } = useReturnedAudits();
  const { data: drafts = [] } = useDraftAudits();
  const hasAttentionItems = returned.length > 0 || drafts.length > 0;

  const handleResume = (_auditId: string, _shelfId: string) => {
    navigate({ to: "/maker/audits/planogram" });
  };

  const handleViewReport = (_auditId: string, _shelfId: string) => {
    navigate({ to: "/maker/audits/planogram" });
  };

  const handleViewAllAudits = () => {
    navigate({ to: "/maker/audits/planogram" });
  };

  return (
    <MainLayout
      pageHeader={
        <PageHeader
          title="Planogram Assistant"
          description={
            hasAttentionItems
              ? "You have audits that need your attention"
              : "Here's how your shelf audits are going"
          }
        >
          <MakerDashboardHeader />
        </PageHeader>
      }
    >
      <div className="ithina-page">
        <div className="ithina-page-inner">
          {/* Key metrics - My Work at a Glance */}
          <MakerAccomplishedCards />

          {/* Maker performance charts */}
          <MakerPerformanceCharts />

          {/* Two-column layout: Attention + Assigned Shelves (same height) */}
          <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2">
            <MakerAttentionSection
              onResume={handleResume}
              onViewReport={handleViewReport}
              onViewAll={hasAttentionItems ? handleViewAllAudits : undefined}
            />
            <MakerAssignedTable
              onShelfClick={(shelfId) => {
                navigate({
                  to: "/maker/audits/planogram/$shelfId",
                  params: { shelfId },
                });
              }}
            />
          </div>

          {/* Recent audit history section */}
          <section
            id="my-audits-section"
            aria-labelledby="my-audits-heading"
            className="scroll-mt-8 space-y-4"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="ithina-overline mb-1">History</p>
                <h2
                  id="my-audits-heading"
                  className="text-foreground text-xl font-bold"
                >
                  Recent Audit History
                </h2>
              </div>
              <Link
                to="/maker/audits/planogram"
                className="text-accent hover:text-accent/90 inline-flex shrink-0 items-center gap-1.5 text-sm font-medium transition-colors"
              >
                View All Audits
                <ChevronRight className="size-4" aria-hidden />
              </Link>
            </div>

            <MyAuditsSection
              onResume={handleResume}
              onViewReport={handleViewReport}
              maxItems={5}
            />
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
