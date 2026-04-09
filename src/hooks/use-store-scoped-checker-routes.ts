import { useMemo } from "react";
import { useLocation, useParams } from "@tanstack/react-router";

import { useStore } from "@/providers/store";

/**
 * Route targets for checker UI shared between `/checker/...` and `/admin/$storeId/...`.
 * Admins in store context use the same page components with store-scoped URLs.
 */
export function useStoreScopedCheckerRoutes() {
  const location = useLocation();
  const params = useParams({ strict: false });
  const { selectedStore } = useStore();

  return useMemo(() => {
    const pathname = location.pathname;
    const isAdminPath = pathname.startsWith("/admin/");
    const storeSegment =
      (typeof params.storeId === "string" && params.storeId.length > 0
        ? params.storeId
        : undefined) ??
      (isAdminPath ? (selectedStore?.id ?? selectedStore?.name) : undefined) ??
      undefined;

    const isAdminStoreScoped = Boolean(isAdminPath && storeSegment);

    const toAuditReview = () =>
      isAdminStoreScoped && storeSegment
        ? ({ to: "/admin/$storeId/audit-review", params: { storeId: storeSegment } } as const)
        : ({ to: "/checker/audit-review" } as const);

    const toReviewAudit = (auditId: string) =>
      isAdminStoreScoped && storeSegment
        ? ({
            to: "/admin/$storeId/review/$auditId",
            params: { storeId: storeSegment, auditId },
          } as const)
        : ({ to: "/checker/review/$auditId", params: { auditId } } as const);

    const toAuditReport = (auditId: string) =>
      isAdminStoreScoped && storeSegment
        ? ({
            to: "/admin/$storeId/audit-report/$auditId",
            params: { storeId: storeSegment, auditId },
          } as const)
        : ({ to: "/checker/audit-report/$auditId", params: { auditId } } as const);

    const toKnowledgeCenter = () =>
      isAdminStoreScoped && storeSegment
        ? ({ to: "/admin/$storeId/knowledge-center", params: { storeId: storeSegment } } as const)
        : ({ to: "/checker/knowledge-center" } as const);

    const toShelfIndex = () =>
      isAdminStoreScoped && storeSegment
        ? ({ to: "/admin/$storeId/shelf/", params: { storeId: storeSegment } } as const)
        : ({ to: "/checker/shelf/" } as const);

    const toReportsStoreLevel = () =>
      isAdminStoreScoped && storeSegment
        ? ({
            to: "/admin/$storeId/reports/store-level",
            params: { storeId: storeSegment },
          } as const)
        : ({ to: "/checker/reports/store-level/" } as const);

    const toReportsShelfLevel = () =>
      isAdminStoreScoped && storeSegment
        ? ({
            to: "/admin/$storeId/reports/shelf-level",
            params: { storeId: storeSegment },
          } as const)
        : ({ to: "/checker/reports/shelf-level/" } as const);

    const toReportsAdhoc = () =>
      isAdminStoreScoped && storeSegment
        ? ({
            to: "/admin/$storeId/reports/adhoc",
            params: { storeId: storeSegment },
          } as const)
        : ({ to: "/checker/reports/adhoc/" } as const);

    const toReportsView = (reportId: string) =>
      isAdminStoreScoped && storeSegment
        ? ({
            to: "/admin/$storeId/reports/view/$reportId",
            params: { storeId: storeSegment, reportId },
          } as const)
        : ({ to: "/checker/reports/view/$reportId/", params: { reportId } } as const);

    const reviewAuditHref = (auditId: string) =>
      isAdminStoreScoped && storeSegment
        ? `/admin/${encodeURIComponent(storeSegment)}/review/${encodeURIComponent(auditId)}`
        : `/checker/review/${encodeURIComponent(auditId)}`;

    return {
      isAdminStoreScoped,
      storeSegment,
      toAuditReview,
      toReviewAudit,
      toAuditReport,
      toKnowledgeCenter,
      toShelfIndex,
      toReportsStoreLevel,
      toReportsShelfLevel,
      toReportsAdhoc,
      toReportsView,
      reviewAuditHref,
    };
  }, [location.pathname, params.storeId, selectedStore?.id, selectedStore?.name]);
}
