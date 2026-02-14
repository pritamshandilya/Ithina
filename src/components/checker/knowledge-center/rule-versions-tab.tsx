/**
 * Rule Versions Tab
 *
 * View version history per rule. Display version number, effective date,
 * status, and optional change summary.
 */

import { useState } from "react";

import {
  useComplianceRules,
  useRuleVersions,
} from "@/features/checker/hooks";
import { RuleStatusBadge } from "@/components/shared";
import { format } from "date-fns";
import type { RuleVersion, RuleVersionStatus } from "@/types/checker";

const VERSION_STATUS_OPTIONS: RuleVersionStatus[] = ["Draft", "Active", "Archived", "Retired"];

export function RuleVersionsTab() {
  const [selectedRuleId, setSelectedRuleId] = useState<string | undefined>();
  const [versionFilter, setVersionFilter] = useState<RuleVersionStatus | "">("");

  const { data: rules } = useComplianceRules();
  const { data: versions, isLoading, error } = useRuleVersions(selectedRuleId);

  const filteredVersions = (versions ?? []).filter(
    (v) => !versionFilter || v.status === versionFilter
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Rule Versions</h2>
        <p className="text-sm text-muted-foreground">
          View version history and effective dates for each rule
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Rule selector */}
        <div className="rounded-lg border border-border bg-card/50 p-4">
          <h3 className="mb-3 text-sm font-medium text-foreground">Filter by Rule</h3>
          <select
            value={selectedRuleId ?? ""}
            onChange={(e) => setSelectedRuleId(e.target.value || undefined)}
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
          >
            <option value="">All rules</option>
            {rules?.map((r) => (
              <option key={r.ruleId} value={r.ruleId}>
                {r.ruleId} – {r.ruleName}
              </option>
            ))}
          </select>

          <h3 className="mt-4 mb-3 text-sm font-medium text-foreground">Filter by Status</h3>
          <select
            value={versionFilter}
            onChange={(e) =>
              setVersionFilter((e.target.value || "") as RuleVersionStatus | "")
            }
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
          >
            <option value="">All statuses</option>
            {VERSION_STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Version list */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            {isLoading ? (
              <div className="flex h-48 items-center justify-center text-muted-foreground">
                Loading versions…
              </div>
            ) : error ? (
              <div className="p-6 text-destructive">
                Failed to load versions. Please try again.
              </div>
            ) : !filteredVersions.length ? (
              <div className="flex flex-col items-center justify-center gap-2 p-12 text-center">
                <p className="text-muted-foreground">
                  {selectedRuleId || versionFilter
                    ? "No versions match your filters."
                    : "No rule versions yet. Create and activate rules to see version history."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredVersions.map((v) => (
                  <VersionRow key={v.id} version={v} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function VersionRow({ version }: { version: RuleVersion }) {
  return (
    <div className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-medium">
            {version.ruleId} v{version.version}
          </span>
          <RuleStatusBadge status={version.status} size="sm" />
        </div>
        <p className="text-sm text-muted-foreground">
          {version.shelfType} · {version.expectedValue}
          {version.tolerance != null && ` (±${version.tolerance})`}
        </p>
        {version.changeSummary && (
          <p className="text-xs text-muted-foreground">{version.changeSummary}</p>
        )}
      </div>
      <div className="flex flex-col items-start gap-1 text-xs text-muted-foreground sm:items-end">
        <span>
          Created {format(new Date(version.createdDate), "MMM d, yyyy")} by {version.createdBy}
        </span>
        {version.effectiveDate && (
          <span>Effective {format(new Date(version.effectiveDate), "MMM d, yyyy")}</span>
        )}
      </div>
    </div>
  );
}
