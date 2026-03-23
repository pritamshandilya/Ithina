import { useSyncExternalStore } from "react";

import { AuthSessionService } from "@/lib/auth/session";

import { AdminComplianceRuleSetsTabContent } from "./compliance-rules-tab/admin-compliance-rule-sets-tab";
import { CheckerComplianceRulesTabContent } from "./compliance-rules-tab/checker-compliance-rules-content";

export function ComplianceRulesTab() {
  const currentUser = useSyncExternalStore(
    (onStoreChange) => AuthSessionService.subscribe(onStoreChange),
    () => AuthSessionService.getSnapshot().user,
    () => null,
  );

  const role = currentUser?.role;

  if (role === "admin" || role === "maker") {
    return <AdminComplianceRuleSetsTabContent />;
  }

  return <CheckerComplianceRulesTabContent />;
}

