import { ComplianceRuleSetsManagementSection } from "./compliance-rules-tab/compliance-rule-sets-management-section";
import { RuleVersionsTab } from "./rule-versions-tab";


export function ComplianceRulesTab() {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-4">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto border-t border-border pt-4">
        <ComplianceRuleSetsManagementSection />
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <RuleVersionsTab />
      </div>
    </div>
  );
}
