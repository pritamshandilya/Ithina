import { createFileRoute, Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ChevronRight } from "lucide-react";

import {
  AuditReviewQueue,
  CheckerAccomplishedCards,
  CheckerAttentionSection,
  CheckerDashboardHeader,
  CheckerPerformanceCharts,
  CheckerStoreShelfPreview,
  KnowledgeCenterSection,
  OverrideActivityPanel,
} from "@/components/checker";
import MainLayout from "@/components/layouts/main";
import {
  useComplianceOverview,
  usePendingAudits,
} from "@/features/checker/hooks";
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
  const {
    data: audits = [],
    isLoading: auditsLoading,
    error: auditsError,
  } = usePendingAudits(selectedStoreId);

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
      <div className="min-h-screen bg-primary p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Header with store selector + primary CTA */}
          <CheckerDashboardHeader hasAttentionItems={hasAttentionItems} />

          {/* Key metrics - Store at a Glance */}
          <CheckerAccomplishedCards />

          {/* Store & Shelf Insights - charts */}
          <CheckerPerformanceCharts />

          {/* Two-column layout: Attention + Store/Shelf Preview (same height) */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 items-stretch">
            <CheckerAttentionSection
              onAuditClick={handleAuditClick}
              onViewAll={audits.length > 0 ? handleViewAllAudits : undefined}
            />
            <CheckerStoreShelfPreview />
          </div>

          {/* Audit Review Queue - compact preview */}
          <section
            id="audit-queue-section"
            aria-labelledby="audit-queue-heading"
            className="space-y-4 scroll-mt-8"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2
                  id="audit-queue-heading"
                  className="text-xl font-bold text-foreground"
                >
                  Audit Review Queue
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Review, approve, or return audits submitted by store workers
                </p>
              </div>
              <Link
                to="/checker/audit-review"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent/90 transition-colors shrink-0"
              >
                View All Audits
                <ChevronRight className="size-4" aria-hidden />
              </Link>
            </div>

            <AuditReviewQueue
              audits={audits}
              isLoading={auditsLoading}
              error={auditsError}
              onAuditClick={handleAuditClick}
            />
          </section>

          {/* Knowledge Center + Override Activity */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <section
              aria-labelledby="knowledge-center-heading"
              className="lg:col-span-2"
            >
              <KnowledgeCenterSection storeId={selectedStoreId} />
            </section>

            <div className="space-y-6">
              <section aria-labelledby="override-activity-heading">
                <OverrideActivityPanel storeId={selectedStoreId} />
              </section>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
