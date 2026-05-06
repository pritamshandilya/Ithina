import { ComplianceRuleSetsManagementSection } from "./complianceRulesTab/ComplianceRuleSetsManagementSection";

export function ComplianceRulesTab() {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-4">
      <div className="border-border flex min-h-0 flex-1 flex-col overflow-y-auto border-t pt-4">
        <ComplianceRuleSetsManagementSection />
      </div>
    </div>
  );
}
