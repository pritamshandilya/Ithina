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
import { MOCK_ALL_ITEMS_REPORT } from "@/lib/analysis/mock-all-items-report";
import type {
  PlanogramItemRow,
  SkuFacingRow,
} from "@/lib/analysis/all-items-report-types";
import { cn } from "@/lib/utils";

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50] as const;

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
    width: 100,
    headerSort: true,
    headerFilter: false,
    formatter: (cell) => {
      const data = (cell as { getData: () => SkuFacingRow }).getData();
      const v = data.facingDiffVariant;
      if (v === "ok")
        return '<span class="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-chart-2/20 text-chart-2 border border-chart-2/40">OK</span>';
      if (v === "extra")
        return '<span class="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-blue-500/20 text-blue-500 border border-blue-500/40">Extra</span>';
      return '<span class="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-destructive/20 text-destructive border border-destructive/40">Short</span>';
    },
  },
];

function escapeHtml(s: string): string {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

/** Simple HTML table for PDF export – avoids Tabulator (oklch/verticalFillMode issues) */
function PdfSimpleTable<T extends { id?: string }>({
  columns,
  data,
  renderCell,
}: {
  columns: { key: keyof T | string; header: string }[];
  data: T[];
  renderCell: (row: T, key: string) => React.ReactNode;
}) {
  const tableStyle: React.CSSProperties = {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "0.8125rem",
    backgroundColor: "#f9fafb",
    color: "#1a1a1a",
  };
  const thStyle: React.CSSProperties = {
    padding: "0.75rem 1rem",
    textAlign: "left",
    fontWeight: 600,
    backgroundColor: "#e8e8e8",
    borderBottom: "2px solid #e5e7eb",
    color: "#1a1a1a",
  };
  const tdStyle: React.CSSProperties = {
    padding: "0.75rem 1rem",
    borderBottom: "1px solid #e5e7eb",
    borderRight: "1px dotted #e5e7eb",
    color: "#1a1a1a",
  };
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={tableStyle}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={String(c.key)} style={thStyle}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={("id" in row ? String(row.id) : undefined) ?? i}
              style={{
                backgroundColor: i % 2 === 0 ? "#f9fafb" : "#f5f5f5",
              }}
            >
              {columns.map((c) => (
                <td key={String(c.key)} style={tdStyle}>
                  {renderCell(row, c.key as string)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function filterRows<T extends object>(
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
  /** PDF export mode: hide search, show all rows without pagination */
  pdfMode?: boolean;
  className?: string;
}

export function AllItemsTab({
  data = MOCK_ALL_ITEMS_REPORT,
  pdfMode = false,
  className,
}: AllItemsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setPlanogramPagination] = useState({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
  });
  const [, setSkuPagination] = useState({
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
    <div className={cn("w-full min-w-0 space-y-4", className)}>
      {/* Search – hidden in PDF mode */}
      {!pdfMode && (
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
      )}

      {/* SKU Facings & Depth Summary */}
      <section className="min-w-0">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">
          SKU Facings & Depth Summary
        </h3>
        <div className="min-w-0 overflow-x-auto">
        {pdfMode ? (
          <PdfSimpleTable
            columns={[
              { key: "productName", header: "SKU / Product" },
              { key: "frontFacings", header: "Front Facings" },
              { key: "detected", header: "Detected" },
              { key: "depth", header: "Depth" },
              { key: "totalExpected", header: "Total Expected" },
              { key: "facingDiffText", header: "Facing Diff" },
              { key: "facingDiffVariant", header: "Status" },
            ]}
            data={filteredSkuFacings}
            renderCell={(row, key) => {
              if (key === "productName") {
                return (
                  <>
                    <span style={{ fontWeight: 500 }}>{String(row.productName)}</span>{" "}
                    <span style={{ color: "#6b7280", fontSize: "0.75rem" }}>({String(row.sku)})</span>
                  </>
                );
              }
              if (key === "facingDiffVariant") {
                const v = row.facingDiffVariant;
                const badgeStyle: React.CSSProperties =
                  v === "ok"
                    ? { background: "#dcfce7", color: "#16a34a", border: "1px solid #86efac" }
                    : v === "extra"
                      ? { background: "#dbeafe", color: "#2563eb", border: "1px solid #93c5fd" }
                      : { background: "#fee2e2", color: "#dc2626", border: "1px solid #fca5a5" };
                return (
                  <span style={{ ...badgeStyle, display: "inline-flex", borderRadius: 4, padding: "2px 8px", fontSize: "0.75rem", fontWeight: 500 }}>
                    {v === "ok" ? "OK" : v === "extra" ? "Extra" : "Short"}
                  </span>
                );
              }
              if (key === "facingDiffText") {
                const color =
                  row.facingDiffVariant === "short"
                    ? "#dc2626"
                    : row.facingDiffVariant === "extra"
                      ? "#2563eb"
                      : "#16a34a";
                return <span style={{ color, fontWeight: 500 }}>{String(row.facingDiffText)}</span>;
              }
              return String((row as unknown as Record<string, unknown>)[key] ?? "—");
            }}
          />
        ) : (
          <DataTable<SkuFacingRow>
            columns={SKU_FACINGS_COLUMNS}
            data={filteredSkuFacings}
            rowIdField="id"
            initialSort={{ field: "productName", dir: "asc" }}
            emptyMessage="No SKU facings match your search."
            pagination
            pageSize={DEFAULT_PAGE_SIZE}
            pageSizeSelector={[...PAGE_SIZE_OPTIONS]}
            onPaginationChange={setSkuPagination}
            headerFilters
            layout="fitDataFill"
          />
        )}
        </div>
      </section>

      {/* All Planogram Items */}
      <section className="min-w-0">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">
          All Planogram Items ({filteredPlanogramItems.length})
        </h3>
        <div className="min-w-0 overflow-x-auto">
        {pdfMode ? (
          <PdfSimpleTable
            columns={[
              { key: "productName", header: "Product / SKU" },
              { key: "issueDescription", header: "Issue" },
              { key: "shelf", header: "Shelf" },
              { key: "complianceLevel", header: "Issue Severity" },
            ]}
            data={filteredPlanogramItems}
            renderCell={(row, key) => {
              if (key === "productName") {
                return (
                  <>
                    <span style={{ fontWeight: 500 }}>{String(row.productName)}</span>{" "}
                    <span style={{ color: "#6b7280", fontSize: "0.75rem" }}>{String(row.sku)}</span>
                  </>
                );
              }
              if (key === "complianceLevel") {
                const level = String(row.complianceLevel);
                const badgeStyle: React.CSSProperties =
                  level === "LOW"
                    ? { background: "#dcfce7", color: "#16a34a", border: "1px solid #86efac" }
                    : level === "MEDIUM"
                      ? { background: "#fef3c7", color: "#d97706", border: "1px solid #fcd34d" }
                      : { background: "#fee2e2", color: "#dc2626", border: "1px solid #fca5a5" };
                return (
                  <span style={{ ...badgeStyle, display: "inline-flex", borderRadius: 4, padding: "2px 8px", fontSize: "0.75rem", fontWeight: 500 }}>
                    {String(level)}
                  </span>
                );
              }
              return String((row as unknown as Record<string, unknown>)[key] ?? "—");
            }}
          />
        ) : (
          <DataTable<PlanogramItemRow>
            columns={PLANOGRAM_ITEMS_COLUMNS}
            data={filteredPlanogramItems}
            rowIdField="id"
            initialSort={{ field: "productName", dir: "asc" }}
            emptyMessage="No planogram items match your search."
            pagination
            pageSize={DEFAULT_PAGE_SIZE}
            pageSizeSelector={[...PAGE_SIZE_OPTIONS]}
            onPaginationChange={setPlanogramPagination}
            headerFilters
            layout="fitDataFill"
          />
        )}
        </div>
      </section>
    </div>
  );
}
