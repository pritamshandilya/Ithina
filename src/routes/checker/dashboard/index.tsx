import {
  createFileRoute,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { useEffect } from "react";

import {
  CheckerAccomplishedCards,
  CheckerAttentionSection,
  CheckerPerformanceCharts,
  CheckerStoreShelfPreview,
  OverrideActivityPanel,
} from "@/components/checker";
import MainLayout from "@/components/layouts/main";
import { PageHeader } from "@/components/shared/PageHeader";
import { useStoreScopedCheckerRoutes } from "@/hooks/useStoreScopedCheckerRoutes";
import { mockCheckerUser } from "@/lib/api/mockData";
import { useStore } from "@/providers/store";
import { useComplianceOverview, usePendingAudits } from "@/queries/checker";

export const Route = createFileRoute("/checker/dashboard/")({
  component: CheckerDashboard,
});

export function CheckerDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const routes = useStoreScopedCheckerRoutes();
  const { selectedStore } = useStore();
  const selectedStoreId = selectedStore?.id || mockCheckerUser.storeId;

  useComplianceOverview(selectedStoreId);
  const { data: audits = [] } = usePendingAudits(selectedStoreId);

  const handleAuditClick = (auditId: string) => {
    navigate({ ...routes.toReviewAudit(auditId) });
  };

  const handleViewAllAudits = () => {
    navigate({ ...routes.toAuditReview() });
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
    <MainLayout
      pageHeader={<PageHeader title="Dashboard" description="Welcome back" />}
    >
      <div className="ithina-page">
        <div className="ithina-page-inner">
          {/* Key metrics - Store at a Glance */}
          <CheckerAccomplishedCards />

          {/* Store & Shelf Insights - charts */}
          <CheckerPerformanceCharts />

          {/* Two-column layout: Attention + Store/Shelf Preview (same height) */}
          <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2">
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
