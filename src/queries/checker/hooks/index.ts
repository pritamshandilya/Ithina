/**
 * Checker Hooks - Barrel Export
 *
 * Centralized exports for all checker-specific TanStack Query hooks.
 * Import these hooks in your components to fetch and mutate checker data.
 */

// Query Hooks
export { useStores, storesKeys } from "./useStores";
export { useComplianceOverview } from "./useComplianceOverview";
export {
  useCheckerDashboardStats,
  checkerDashboardStatsKeys,
} from "./useCheckerDashboardStats";
export { usePendingAudits, pendingAuditsKeys } from "./usePendingAudits";
export {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  notificationsKeys,
} from "./useNotifications";
export { useRuleInfo, ruleInfoKeys } from "./useRuleInfo";
export {
  useOverrideActivity,
  overrideActivityKeys,
} from "./useOverrideActivity";
export { usePublishedAudits, publishedAuditsKeys } from "./usePublishedAudits";

// Mutation Hooks
export {
  useApproveAudit,
  useReturnAudit,
  useOverrideAndApprove,
  useDeleteAudit,
} from "./useAuditActions";

// Audit Detail Hooks
export {
  useAuditDetail,
  useAuditViolations,
  auditDetailKeys,
} from "./useAuditDetail";
export {
  knowledgeCenterKeys,
  useActivateComplianceRule,
  useCloneRetiredRule,
  useComplianceRules,
  useCreateComplianceRule,
  useReferenceDocuments,
  useRetireComplianceRule,
  useRuleVersions,
  useUpdateComplianceRule,
  useUpdateReferenceDocumentLinks,
  useUploadReferenceDocument,
  useValidateRuleActivation,
} from "./useKnowledgeCenter";
export {
  useAssignStoreUser,
  useCreateUser,
  orgKeys,
  useDeactivateUser,
  useDeleteStore,
  useOrganization,
  useInviteUser,
  useRemoveStoreUser,
  useOrgStores,
  useStoreById,
  useOrgUsers,
  useStoreUsers,
  useCreateStore,
  useUpdateStore,
  useUpdateStoreComplianceSettings,
  useUpdateUser,
  useUserById,
} from "./useOrgData";

export { useDimensionUnits } from "./useDimensionUnits";

export {
  shelfTemplatesKeys,
  useShelfTemplates,
  useCreateShelfTemplate,
  useUpdateShelfTemplate,
  useDeleteShelfTemplate,
} from "./useShelfTemplates";

export {
  storeDefaultsKeys,
  useStoreFixtureTypes,
} from "./useStoreFixtureTypes";
