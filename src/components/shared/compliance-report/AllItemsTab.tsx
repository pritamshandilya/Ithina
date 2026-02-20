/**
 * All Items Tab
 *
 * Two sections: SKU Facings & Depth Summary, All Planogram Items.
 * Uses DataTable (Tabulator) with pagination defaults.
 * Data source is mock for now – replace with API when available.
 */

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { MOCK_ALL_ITEMS_REPORT } from "@/features/maker/analysis/mock-all-items-report";
import type {
  PlanogramItemRow,
  PlanogramItemStatus,
  SkuFacingRow,
} from "@/features/maker/analysis/all-items-report-types";
import { cn } from "@/lib/utils";

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50] as const;

function statusIcon(status: PlanogramItemStatus): string {
  const icons: Record<PlanogramItemStatus, string> = {
    matched: '<span class="inline-flex size-5 items-center justify-center rounded-full bg-chart-2/20 text-chart-2" aria-hidden"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></span>',
    misplaced: '<span class="inline-flex size-5 items-center justify-center rounded-full bg-action-warning/20 text-action-warning" aria-hidden"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></span>',
    missing: '<span class="inline-flex size-5 items-center justify-center rounded-full bg-destructive/20 text-destructive" aria-hidden"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></span>',
    extra: '<span class="inline-flex size-5 items-center justify-center rounded-full bg-blue-500/20 text-blue-500" aria-hidden"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/></svg></span>',
  };
  return icons[status] ?? icons.extra;
}

function complianceLevelBadge(level: string): string {
  const color =
    level === "LOW"
      ? "bg-chart-2/20 text-chart-2 border-chart-2/40"
      : level === "MEDIUM"
        ? "bg-action-warning/20 text-action-warning border-action-warning/40"
        : "bg-destructive/20 text-destructive border-destructive/40";
  return `<span class="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium border ${color}">${level}</span>`;
}

const PLANOGRAM_ITEMS_COLUMNS: DataTableColumn<PlanogramItemRow>[] = [
  {
    title: "Match",
    field: "status",
    width: 56,
    headerSort: true,
    headerFilter: false,
    formatter: (cell) => {
      const data = (cell as { getData: () => PlanogramItemRow }).getData();
      return statusIcon(data.status);
    },
  },
  {
    title: "Product / SKU",
    field: "productName",
    minWidth: 200,
    headerSort: true,
    formatter: (cell) => {
      const data = (cell as { getData: () => PlanogramItemRow }).getData();
      return `<span class="font-medium text-foreground">${escapeHtml(data.productName)}</span> <span class="text-muted-foreground text-xs">${escapeHtml(data.sku)}</span>`;
    },
  },
  {
    title: "Issue",
    field: "issueDescription",
    minWidth: 280,
    headerSort: false,
    headerFilter: false,
    formatter: (cell) => {
      const data = (cell as { getData: () => PlanogramItemRow }).getData();
      if (!data.issueDescription) return "—";
      const safe = escapeHtml(data.issueDescription);
      return `<span class="text-muted-foreground text-sm truncate block max-w-full" title="${safe}">${safe}</span>`;
    },
  },
  {
    title: "Shelf",
    field: "shelf",
    width: 90,
    headerSort: true,
  },
  {
    title: "Issue Severity",
    field: "complianceLevel",
    width: 120,
    headerSort: true,
    formatter: (cell) => {
      const val = (cell as { getValue: () => string }).getValue();
      return complianceLevelBadge(val ?? "LOW");
    },
  },
];

const SKU_FACINGS_COLUMNS: DataTableColumn<SkuFacingRow>[] = [
  {
    title: "SKU / Product",
    field: "productName",
    minWidth: 200,
    headerSort: true,
    formatter: (cell) => {
      const data = (cell as { getData: () => SkuFacingRow }).getData();
      return `<span class="font-medium text-foreground">${escapeHtml(data.productName)}</span> <span class="text-muted-foreground text-xs">(${escapeHtml(data.sku)})</span>`;
    },
  },
  {
    title: "Front Facings",
    field: "frontFacings",
    width: 110,
    headerSort: true,
    sorter: "number",
  },
  {
    title: "Detected",
    field: "detected",
    width: 90,
    headerSort: true,
    sorter: "number",
  },
  {
    title: "Depth",
    field: "depth",
    width: 80,
    headerSort: true,
    sorter: "number",
  },
  {
    title: "Total Expected",
    field: "totalExpected",
    width: 120,
    headerSort: true,
    sorter: "number",
  },
  {
    title: "Facing Diff",
    field: "facingDiffText",
    minWidth: 160,
    headerSort: false,
    headerFilter: false,
    formatter: (cell) => {
      const data = (cell as { getData: () => SkuFacingRow }).getData();
      const color =
        data.facingDiffVariant === "short"
          ? "text-destructive"
          : data.facingDiffVariant === "extra"
            ? "text-blue-500"
            : "text-chart-2";
      return `<span class="font-medium ${color}">${escapeHtml(data.facingDiffText)}</span>`;
    },
  },
  {
    title: "Status",
    field: "facingDiffVariant",
    width: 90,
    headerSort: true,
    headerFilter: false,
    formatter: (cell) => {
      const data = (cell as { getData: () => SkuFacingRow }).getData();
      const v = data.facingDiffVariant;
      if (v === "ok")
        return '<span class="inline-flex size-5 items-center justify-center rounded-full bg-chart-2/20 text-chart-2" aria-hidden"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></span>';
      if (v === "extra")
        return '<span class="inline-flex size-5 items-center justify-center rounded-full bg-blue-500/20 text-blue-500" aria-hidden"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/></svg></span>';
      return '<span class="inline-flex size-5 items-center justify-center rounded-full bg-destructive/20 text-destructive" aria-hidden"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></span>';
    },
  },
];

function escapeHtml(s: string): string {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

function filterRows<T extends Record<string, unknown>>(
  rows: T[],
  query: string,
  searchFields: (keyof T)[]
): T[] {
  if (!query.trim()) return rows;
  const q = query.toLowerCase().trim();
  return rows.filter((row) =>
    searchFields.some((field) => {
      const val = row[field];
      return val != null && String(val).toLowerCase().includes(q);
    })
  );
}

export interface AllItemsTabProps {
  /** Report data – defaults to mock; pass from API when available */
  data?: typeof MOCK_ALL_ITEMS_REPORT;
  className?: string;
}

export function AllItemsTab({
  data = MOCK_ALL_ITEMS_REPORT,
  className,
}: AllItemsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [planogramPagination, setPlanogramPagination] = useState({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
  });
  const [skuPagination, setSkuPagination] = useState({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
  });

  const filteredPlanogramItems = useMemo(
    () =>
      filterRows(
        data.planogramItems,
        searchQuery,
        ["productName", "sku", "shelf", "issueDescription"]
      ),
    [data.planogramItems, searchQuery]
  );

  const filteredSkuFacings = useMemo(
    () =>
      filterRows(data.skuFacings, searchQuery, ["productName", "sku"]),
    [data.skuFacings, searchQuery]
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" aria-hidden />
        <Input
          type="search"
          placeholder="Search products, SKUs, or issues..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-card"
        />
      </div>

      {/* SKU Facings & Depth Summary */}
      <section>
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">
          SKU Facings & Depth Summary
        </h3>
        <DataTable<SkuFacingRow>
          columns={SKU_FACINGS_COLUMNS}
          data={filteredSkuFacings}
          rowIdField="id"
          initialSort={{ field: "productName", dir: "asc" }}
          emptyMessage="No SKU facings match your search."
          pageSize={DEFAULT_PAGE_SIZE}
          pageSizeSelector={[...PAGE_SIZE_OPTIONS]}
          onPaginationChange={setSkuPagination}
          headerFilters={true}
        />
      </section>

      {/* All Planogram Items */}
      <section>
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">
          All Planogram Items ({filteredPlanogramItems.length})
        </h3>
        <DataTable<PlanogramItemRow>
          columns={PLANOGRAM_ITEMS_COLUMNS}
          data={filteredPlanogramItems}
          rowIdField="id"
          initialSort={{ field: "productName", dir: "asc" }}
          emptyMessage="No planogram items match your search."
          pageSize={DEFAULT_PAGE_SIZE}
          pageSizeSelector={[...PAGE_SIZE_OPTIONS]}
          onPaginationChange={setPlanogramPagination}
          headerFilters={true}
        />
      </section>
    </div>
  );
}
