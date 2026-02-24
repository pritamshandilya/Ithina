import { createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import {
  CheckerAccomplishedCards,
  CheckerAttentionSection,
  CheckerDashboardHeader,
  CheckerPerformanceCharts,
  CheckerStoreShelfPreview,
  OverrideActivityPanel,
} from "@/components/checker";
import MainLayout from "@/components/layouts/main";
import { useComplianceOverview, usePendingAudits } from "@/features/checker/hooks";
import { mockCheckerUser } from "@/lib/api/mock-data";
import { useStore } from "@/providers/store";

export const Route = createFileRoute("/checker/dashboard")({
  component: CheckerDashboard,
});

function CheckerDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedStore } = useStore();
  const selectedStoreId = selectedStore?.id || mockCheckerUser.storeId;

  const { data: complianceData } = useComplianceOverview(selectedStoreId);
  const { data: audits = [] } = usePendingAudits(selectedStoreId);

  const hasAttentionItems =
    (complianceData?.criticalAudits ?? 0) > 0 ||
    (complianceData?.totalPendingAudits ?? 0) > 0;

  const handleAuditClick = (auditId: string) => {
    navigate({ to: "/checker/review/$auditId", params: { auditId } });
  };

  const handleViewAllAudits = () => {
    navigate({ to: "/checker/audit-review" });
  };

  // Scroll to hash target when navigating with hash (e.g. sidebar links)
  useEffect(() => {
    const hash = location.hash?.slice(1);
    if (hash) {
      const el = document.getElementById(hash);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location.hash]);

  return (
    <MainLayout>
      <div className="min-h-screen bg-primary pt-2 px-2 pb-4 sm:pt-3 sm:px-2 sm:pb-4 lg:pt-4 lg:px-2 lg:pb-5">
        <div className="mx-auto w-full max-w-screen-2xl space-y-5">
          {/* Header with store selector + primary CTA */}
          <CheckerDashboardHeader hasAttentionItems={hasAttentionItems} />

          {/* Key metrics - Store at a Glance */}
          <CheckerAccomplishedCards />

          {/* Store & Shelf Insights - charts */}
          <CheckerPerformanceCharts />

          {/* Two-column layout: Attention + Store/Shelf Preview (same height) */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 items-stretch">
            <CheckerAttentionSection
              onAuditClick={handleAuditClick}
              onViewAll={audits.length > 0 ? handleViewAllAudits : undefined}
            />
            <CheckerStoreShelfPreview />
          </div>

          {/* Override Activity */}
          <section
            id="override-activity-section"
            aria-labelledby="override-activity-heading"
            className="scroll-mt-8"
          >
            <h2 id="override-activity-heading" className="sr-only">
              Override Activity
            </h2>
            <OverrideActivityPanel storeId={selectedStoreId} />
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
