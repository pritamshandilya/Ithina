import { createFileRoute, useNavigate } from "@tanstack/react-router";

import MainLayout from "@/components/layouts/main";
import {
  MakerAccomplishedCards,
  MakerAssignedPreview,
  MakerAttentionSection,
  MakerDashboardHeader,
  MyAuditsSection,
} from "@/components/maker";
import { useDraftAudits, useReturnedAudits } from "@/features/maker/hooks";

export const Route = createFileRoute("/maker/dashboard")({
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

  const scrollToMyAudits = () => {
    document.getElementById("my-audits-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-primary p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Header with welcome + primary CTA */}
          <MakerDashboardHeader hasAttentionItems={hasAttentionItems} />

          {/* Key metrics - My Work at a Glance */}
          <MakerAccomplishedCards />

          {/* Two-column layout: Attention + Assigned Preview */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <MakerAttentionSection
              onResume={handleResume}
              onViewReport={handleViewReport}
              onViewAll={hasAttentionItems ? scrollToMyAudits : undefined}
            />
            <MakerAssignedPreview
              onShelfClick={(shelfId) => {
                navigate({ to: "/maker/audits/planogram/$shelfId", params: { shelfId } });
              }}
            />
          </div>

          {/* Full My Audits section (collapsible context) */}
          <section
            id="my-audits-section"
            aria-labelledby="my-audits-heading"
            className="space-y-4 scroll-mt-8"
          >
            <div>
              <h2 id="my-audits-heading" className="text-xl font-bold text-foreground">
                My Audits
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Full list of draft and returned audits
              </p>
            </div>

            <MyAuditsSection
              onResume={handleResume}
              onViewReport={handleViewReport}
            />
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
