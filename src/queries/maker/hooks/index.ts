/**
 * Barrel export for all maker hooks
 */

export { useQuickStats, quickStatsKeys } from "./useQuickStats";
export {
  useMakerDashboardStats,
  makerDashboardStatsKeys,
} from "./useMakerDashboardStats";
export {
  useReturnedAudits,
  returnedAuditsKeys,
} from "./useReturnedAudits";
export {
  useDraftAudits,
  useSaveDraftProgress,
  useDeleteDraft,
  draftAuditsKeys,
} from "./useDraftAudits";
export { useStores, storesKeys } from "./useStores";
export { useCreateShelf } from "./useCreateShelf";
export { useCreateFixture } from "./useCreateFixture";
export { useStoreFixtures } from "./useStoreFixtures";
export { useMakerAudits, makerAuditsKeys } from "./useMakerAudits";
export { useAdhocAnalyses, adhocAnalysesKeys } from "./useAdhocAnalyses";
export { useComplianceRuleSets, complianceRuleSetsKeys } from "./useComplianceRuleSets";
export { useCreateComplianceRuleSet } from "./useCreateComplianceRuleSet";
export { useRulesByRuleSetId, rulesByRuleSetIdKeys } from "./useRulesByRuleSetId";
export { usePlanogramList, planogramListKeys } from "./usePlanogramList";
export { usePlanogramById } from "./usePlanogramById";
export {
  usePlanogramShelfPreview,
  planogramShelfPreviewKeys,
  type PlanogramShelfPreview,
} from "./usePlanogramShelfPreview";
export {
  useAssignPlanogramToShelf,
  useUpdateShelfArrangement,
} from "./usePlanogramMutations";
export { useHistoricalAnalyses } from "./useHistoricalAnalyses";
export { useShelves, useShelf } from "./useShelves";
export { useUpdateShelf } from "./useUpdateShelf";
export { useDeleteShelf } from "./useDeleteShelf";
