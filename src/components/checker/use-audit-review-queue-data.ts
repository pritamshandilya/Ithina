import { useMemo } from "react";

import type { CheckerAudit } from "@/types/checker";
import type { AuditQueueFilter, AuditQueueSort } from "@/types/checker-ui";

interface UseAuditReviewQueueDataParams {
  audits: CheckerAudit[];
  activeFilter: AuditQueueFilter;
  sortBy: AuditQueueSort;
  searchQuery: string;
}

export function useAuditReviewQueueData({
  audits,
  activeFilter,
  sortBy,
  searchQuery,
}: UseAuditReviewQueueDataParams) {
  return useMemo(() => {
    let filtered = audits;

    if (activeFilter === "critical") {
      filtered = filtered.filter((a) => (a.complianceScore || 0) < 50);
    } else if (activeFilter === "attention") {
      filtered = filtered.filter((a) => {
        const score = a.complianceScore || 0;
        return score >= 50 && score < 80;
      });
    } else if (activeFilter === "good") {
      filtered = filtered.filter((a) => (a.complianceScore || 0) >= 80);
    } else if (activeFilter === "planogram") {
      filtered = filtered.filter((a) => a.mode === "planogram-based" || a.mode === "vision-edge");
    } else if (activeFilter === "adhoc") {
      filtered = filtered.filter((a) => a.mode === "adhoc" || a.mode === "assist-mode");
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((audit) => {
        const shelfInfo =
          `aisle ${audit.shelfInfo.aisleCode} bay ${audit.shelfInfo.bayCode} ${audit.shelfInfo.shelfName}`.toLowerCase();
        const submitter = audit.submittedByName.toLowerCase();
        return shelfInfo.includes(query) || submitter.includes(query);
      });
    }

    const sorted = [...filtered];
    const getSubmittedAtTime = (audit: CheckerAudit) =>
      audit.submittedAt ? new Date(audit.submittedAt).getTime() : 0;

    switch (sortBy) {
      case "compliance-asc":
        sorted.sort((a, b) => (a.complianceScore || 0) - (b.complianceScore || 0));
        break;
      case "compliance-desc":
        sorted.sort((a, b) => (b.complianceScore || 0) - (a.complianceScore || 0));
        break;
      case "time-asc":
        sorted.sort((a, b) => getSubmittedAtTime(a) - getSubmittedAtTime(b));
        break;
      case "time-desc":
        sorted.sort((a, b) => getSubmittedAtTime(b) - getSubmittedAtTime(a));
        break;
      case "violations-desc":
        sorted.sort((a, b) => b.violationCount - a.violationCount);
        break;
      case "violations-asc":
        sorted.sort((a, b) => a.violationCount - b.violationCount);
        break;
    }

    return sorted;
  }, [audits, activeFilter, sortBy, searchQuery]);
}
