/**
 * Rule Versions Tab
 *
 * View version history per rule in a tabular format.
 * Uses shared DataTable (Tabulator) - same format as audit review queue.
 */

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";

import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  useComplianceRules,
  useRuleVersions,
} from "@/features/checker/hooks";
import { format } from "date-fns";
import type { RuleVersion, RuleVersionStatus } from "@/types/checker";

const VERSION_STATUS_OPTIONS: RuleVersionStatus[] = ["Draft", "Active", "Archived", "Retired"];

type VersionsSort = "createdDate-desc" | "createdDate-asc" | "ruleId-asc" | "version-desc";

/** Badge HTML for version status */
function versionStatusBadgeHtml(status: RuleVersionStatus): string {
  const config: Record<RuleVersionStatus, string> = {
    Draft: "bg-muted/80 text-muted-foreground border-border",
    Active: "bg-chart-2/20 text-chart-2 border-chart-2/30",
    Archived: "bg-muted/50 text-muted-foreground border-border",
    Retired: "bg-muted/60 text-muted-foreground border-border",
  };
  const cls = config[status];
  return `<span class="inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium ${cls}">${status}</span>`;
}

export function RuleVersionsTab() {
  const [selectedRuleId, setSelectedRuleId] = useState<string | undefined>();
  const [versionFilter, setVersionFilter] = useState<RuleVersionStatus | "">("");
  const [tablePagination, setTablePagination] = useState({ page: 1, pageSize: 10 });
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<VersionsSort>("createdDate-desc");

  const { data: rules } = useComplianceRules();
  const { data: versions, isLoading, error } = useRuleVersions(selectedRuleId);

  const filteredVersions = useMemo(() => {
    let result = (versions ?? []).filter((v) => !versionFilter || v.status === versionFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (v) =>
          v.ruleId.toLowerCase().includes(q) ||
          (v.changeSummary?.toLowerCase().includes(q) ?? false) ||
          v.expectedValue.toLowerCase().includes(q) ||
          v.shelfType.toLowerCase().includes(q)
      );
    }
    switch (sortBy) {
      case "createdDate-desc":
        result.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
        break;
      case "createdDate-asc":
        result.sort((a, b) => new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime());
        break;
      case "ruleId-asc":
        result.sort((a, b) => a.ruleId.localeCompare(b.ruleId));
        break;
      case "version-desc":
        result.sort((a, b) => b.version - a.version);
        break;
    }
    return result;
  }, [versions, versionFilter, searchQuery, sortBy]);

  useEffect(() => {
    setTablePagination((p) => ({ ...p, page: 1 }));
  }, [selectedRuleId, versionFilter, searchQuery, sortBy]);

  const tableColumns = useMemo<DataTableColumn<RuleVersion>[]>(
    () => [
      {
        title: "Rule ID",
        field: "ruleId",
        width: 100,
        headerFilter: false,
        formatter: (c) => `<span class="font-mono text-xs">${(c as { getValue: () => string }).getValue()}</span>`,
      },
      {
        title: "Version",
        field: "version",
        width: 90,
        sorter: "number",
        headerFilter: false,
      },
      {
        title: "Status",
        field: "status",
        width: 100,
        headerFilter: false,
        formatter: (c) => versionStatusBadgeHtml((c as { getValue: () => RuleVersionStatus }).getValue()),
      },
      { title: "Shelf Type", field: "shelfType", width: 110, headerFilter: false },
      { title: "Expected Value", field: "expectedValue", minWidth: 160 },
      {
        title: "Tolerance",
        field: "tolerance",
        width: 90,
        headerFilter: false,
        formatter: (c) => {
          const v = (c as { getValue: () => number | undefined }).getValue();
          return v != null ? String(v) : "—";
        },
      },
      { title: "Severity", field: "severity", width: 90, headerFilter: false },
      {
        title: "Created",
        field: "createdDate",
        width: 120,
        sorter: "date",
        headerFilter: false,
        formatter: (c) => {
          const val = (c as { getValue: () => Date }).getValue();
          return val ? format(new Date(val), "MMM d, yyyy") : "";
        },
      },
      {
        title: "Effective",
        field: "effectiveDate",
        width: 120,
        sorter: "date",
        headerFilter: false,
        formatter: (c) => {
          const val = (c as { getValue: () => Date | undefined }).getValue();
          return val ? format(new Date(val), "MMM d, yyyy") : "—";
        },
      },
      { title: "Created By", field: "createdBy", width: 180, headerFilter: false },
      {
        title: "Change Summary",
        field: "changeSummary",
        minWidth: 180,
        formatter: (c) => {
          const val = (c as { getValue: () => string | undefined }).getValue();
          return val ? `<span class="text-muted-foreground">${String(val).replace(/</g, "&lt;")}</span>` : "—";
        },
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Rule Versions</h2>
        <p className="text-sm text-muted-foreground">
          View version history and effective dates for each rule
        </p>
      </div>

      {/* Search, Filters, Sort - audit queue style */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-end gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              placeholder="Search by rule ID, expected value, shelf type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              aria-label="Search versions"
            />
          </div>
          <div className="min-w-[200px]">
            <label className="mb-1 block text-xs text-muted-foreground">Filter by Rule</label>
            <Select
              value={selectedRuleId ?? ""}
              onChange={(e) => setSelectedRuleId(e.target.value || undefined)}
            >
              <option value="">All rules</option>
              {rules?.map((r) => (
                <option key={r.ruleId} value={r.ruleId}>
                  {r.ruleId} – {r.ruleName}
                </option>
              ))}
            </Select>
          </div>
          <div className="min-w-[180px]">
            <label className="mb-1 block text-xs text-muted-foreground">Filter by Status</label>
            <Select
              value={versionFilter}
              onChange={(e) =>
                setVersionFilter((e.target.value || "") as RuleVersionStatus | "")
              }
            >
              <option value="">All statuses</option>
              {VERSION_STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Sort by:</span>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as VersionsSort)}
            aria-label="Sort versions"
            className="w-auto min-w-[180px]"
          >
            <option value="createdDate-desc">Newest First</option>
            <option value="createdDate-asc">Oldest First</option>
            <option value="ruleId-asc">Rule ID A–Z</option>
            <option value="version-desc">Highest Version First</option>
          </Select>
        </div>
      </div>

      {/* Versions DataTable */}
      {isLoading ? (
        <div className="flex h-48 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground">
          Loading versions…
        </div>
      ) : error ? (
        <div className="rounded-lg border border-border bg-card p-6 text-destructive">
          Failed to load versions. Please try again.
        </div>
      ) : !filteredVersions.length ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-card/50 p-12 text-center">
          <p className="text-muted-foreground">
            {searchQuery.trim()
              ? `No versions found matching "${searchQuery}"`
              : selectedRuleId || versionFilter
                ? "No versions match your filters."
                : "No rule versions yet. Create and activate rules to see version history."}
          </p>
          {searchQuery.trim() && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="mt-2 text-sm underline text-accent hover:text-accent/80"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <>
          <DataTable<RuleVersion>
            columns={tableColumns}
            data={filteredVersions}
            rowIdField="id"
            initialSort={{ field: "createdDate", dir: "desc" }}
            emptyMessage="No versions match the current filters"
            pageSize={10}
            pageSizeSelector={[5, 10, 20, 50]}
            onPaginationChange={setTablePagination}
          />
          <p className="text-sm text-muted-foreground text-center">
            Showing{" "}
            {Math.min(
              tablePagination.pageSize,
              Math.max(0, filteredVersions.length - (tablePagination.page - 1) * tablePagination.pageSize)
            )}{" "}
            of {filteredVersions.length} versions
          </p>
        </>
      )}
    </div>
  );
}
