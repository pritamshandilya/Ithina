import type { DataTableColumn } from "@/components/ui/data-table";
import type { CheckerAudit } from "@/types/checker";
import type { AuditQueueFilter } from "@/types/checker-ui";

export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];
export const INITIAL_SORT = { field: "complianceScore", dir: "asc" } as const;
export const CARD_PAGE_SIZE = 9;

export const filterOptions: {
  value: AuditQueueFilter;
  label: string;
  count?: (audits: CheckerAudit[]) => number;
}[] = [
  { value: "all", label: "All Pending", count: (audits) => audits.length },
  {
    value: "critical",
    label: "Critical",
    count: (audits) => audits.filter((a) => (a.complianceScore || 0) < 50).length,
  },
  {
    value: "attention",
    label: "Needs Attention",
    count: (audits) =>
      audits.filter((a) => {
        const score = a.complianceScore || 0;
        return score >= 50 && score < 80;
      }).length,
  },
  {
    value: "good",
    label: "Good",
    count: (audits) => audits.filter((a) => (a.complianceScore || 0) >= 80).length,
  },
  {
    value: "planogram",
    label: "Planogram Based",
    count: (audits) =>
      audits.filter((a) => a.mode === "planogram-based" || a.mode === "vision-edge").length,
  },
  {
    value: "adhoc",
    label: "Adhoc Analysis",
    count: (audits) =>
      audits.filter((a) => a.mode === "adhoc" || a.mode === "assist-mode").length,
  },
];

export type ViewMode = "table" | "card";

export const AUDIT_BASE_TABLE_COLUMNS: DataTableColumn<CheckerAudit>[] = [
  {
    title: "Aisle",
    field: "shelfInfo.aisleCode",
    sorter: "string",
    width: 90,
    formatter: (cell) => {
      const value = (cell as { getValue: () => string | undefined }).getValue();
      return value || "A-";
    },
  },
  {
    title: "Bay",
    field: "shelfInfo.bayCode",
    sorter: "string",
    width: 90,
    formatter: (cell) => {
      const value = (cell as { getValue: () => string | undefined }).getValue();
      return value || "B-";
    },
  },
  {
    title: "Shelf",
    field: "shelfInfo.shelfName",
    sorter: "string",
    minWidth: 200,
  },
  {
    title: "Submitter",
    field: "submittedByName",
    sorter: "string",
    minWidth: 160,
  },
  {
    title: "Mode",
    field: "mode",
    sorter: "string",
    width: 150,
    formatter: (cell) => {
      const mode = (cell as { getValue: () => string }).getValue();
      return mode === "planogram-based" || mode === "vision-edge"
        ? "Planogram Based"
        : "Adhoc Analysis";
    },
  },
  {
    title: "Compliance",
    field: "complianceScore",
    sorter: "number",
    width: 130,
    formatter: (cell) => {
      const score = (cell as { getValue: () => number | undefined }).getValue();
      if (score == null) return "N/A";
      const color =
        score < 50
          ? "var(--destructive)"
          : score < 80
            ? "var(--action-warning)"
            : "var(--chart-2)";
      return `<span class="tabular-nums font-semibold" style="color:${color}">${score}%</span>`;
    },
  },
  { title: "Violations", field: "violationCount", sorter: "number", width: 120 },
  {
    title: "Submitted",
    field: "submittedAt",
    sorter: "datetime",
    width: 170,
    formatter: (cell) => {
      const value = (cell as { getValue: () => string | Date | undefined }).getValue();
      return value ? new Date(value).toLocaleString() : "N/A";
    },
  },
];
