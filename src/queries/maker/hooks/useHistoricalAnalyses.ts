/**
 * useHistoricalAnalyses Hook
 *
 * Combines adhoc analyses and planogram runs into a unified list for the
 * Historical Analysis page. Sorted by run date descending.
 */

import { useMemo } from "react";
import { useAdhocAnalyses } from "./useAdhocAnalyses";
import { useShelves } from "./useShelves";
import type { HistoricalAnalysisRow } from "@/types/maker";
import { mockUser } from "@/lib/api/mock-data";
import { useStore } from "@/providers/store";

export function useHistoricalAnalyses(): {
  data: HistoricalAnalysisRow[];
  isLoading: boolean;
} {
  const { selectedStore } = useStore();
  const storeId = selectedStore?.id ?? mockUser.storeId;
  const { data: adhocAnalyses = [], isLoading: isAdhocLoading } = useAdhocAnalyses(storeId);
  const { data: shelves = [], isLoading: isShelvesLoading } = useShelves();

  const data = useMemo(() => {
    const adhocRows: HistoricalAnalysisRow[] = adhocAnalyses.map((a) => ({
      id: a.id,
      type: "adhoc",
      name: a.name,
      storeName: a.storeName,
      runDate: a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt),
      status: a.status,
      complianceScore: a.complianceScore,
      storeId: a.storeId,
      errorMessage: a.errorMessage,
      shelfId: a.shelfId,
      shelfName: a.shelfName,
    }));

    const planogramRows: HistoricalAnalysisRow[] = shelves
      .filter((s) => s.lastAuditDate)
      .map((s) => ({
        id: `planogram-${s.id}`,
        type: "planogram" as const,
        name: s.shelfName,
        storeName: selectedStore?.name ?? mockUser.storeName,
        runDate: s.lastAuditDate instanceof Date ? s.lastAuditDate : new Date(s.lastAuditDate!),
        status: "completed" as const,
        complianceScore: s.complianceScore,
        shelfId: s.id,
        shelfName: s.shelfName,
        planogramName: s.shelfName,
      }));

    const combined = [...adhocRows, ...planogramRows];
    return combined.sort((a, b) => b.runDate.getTime() - a.runDate.getTime());
  }, [adhocAnalyses, shelves, selectedStore?.name]);

  return {
    data,
    isLoading: isAdhocLoading || isShelvesLoading,
  };
}
