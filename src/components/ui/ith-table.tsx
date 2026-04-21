/**
 * IthTable — Ithina Design System data table.
 *
 * Exact match to ai_studio_code HTML reference + globals.css:
 *   thead tr  → background: rgba(15,21,35,.95), backdrop-filter: blur(4px)
 *   thead th  → font-mono 10px uppercase tracking-widest text-slate-500
 *               px-5 py-3, border-b border-ithina-border, bg-transparent
 *   tbody tr  → border-b border-ithina-border/40, hover:bg-white/[0.018]
 *   td        → px-5 py-[14px] text-[13px] text-slate-400 tabular-nums
 */

import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/* ─── Column definition ──────────────────────────────────────────────────── */

export interface IthColumnDef<TRow> {
  key: string;
  label: string;
  /** Optional custom header renderer — overrides label + sort icon */
  headerRender?: () => React.ReactNode;
  align?: "left" | "center" | "right";
  /** Min-width Tailwind class, e.g. "min-w-[140px]" */
  width?: string;
  sortable?: boolean;
  render?: (row: TRow, index: number) => React.ReactNode;
  field?: keyof TRow;
}

export interface IthTablePaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  /** Label shown in bottom-left for compact layout. Default: "rows" */
  rowLabel?: string;
  /** `compact` = prev/next + page chips. `full` = "Showing X–Y of Z", optional page size, First/Prev/Next/Last. */
  layout?: "compact" | "full";
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}

export interface IthTableEmptyProps {
  icon?: React.ReactNode;
  message?: string;
}

export interface IthTableProps<TRow> {
  data: TRow[];
  columns: IthColumnDef<TRow>[];
  rowKey: (row: TRow) => string;
  onRowClick?: (row: TRow, e: React.MouseEvent<HTMLTableRowElement>) => void;
  rowClassName?: (row: TRow) => string;
  pagination?: IthTablePaginationProps;
  /** Optional second header row (e.g. column filters). Length must match columns when provided. */
  filterRow?: ReactNode[];
  empty?: IthTableEmptyProps;
  className?: string;
  rowHighlight?: (row: TRow) => "purple" | "emerald" | "amber" | "rose" | null;
}

/* ─── Internal ───────────────────────────────────────────────────────────── */

type SortDir = "asc" | "desc" | null;

const ALIGN_TH: Record<string, string> = {
  left:   "text-left",
  center: "text-center",
  right:  "text-right",
};

const ALIGN_TD: Record<string, string> = {
  left:   "text-left",
  center: "text-center",
  right:  "text-right",
};

const HIGHLIGHT_CLASS: Record<string, string> = {
  purple:  "border-l-2 border-l-ithina-purple bg-ithina-purple/[0.06]",
  emerald: "border-l-2 border-l-emerald-400  bg-emerald-400/[0.05]",
  amber:   "border-l-2 border-l-amber-400    bg-amber-400/[0.05]",
  rose:    "border-l-2 border-l-rose-400     bg-rose-400/[0.05]",
};

function SortIcon({ dir }: { dir: SortDir }) {
  if (dir === "asc")  return <ChevronUp   className="size-3 shrink-0 text-ithina-purple" strokeWidth={2.5} aria-hidden />;
  if (dir === "desc") return <ChevronDown  className="size-3 shrink-0 text-ithina-purple" strokeWidth={2.5} aria-hidden />;
  return <ChevronsUpDown className="size-3 shrink-0 text-slate-700 group-hover:text-slate-500" strokeWidth={2} aria-hidden />;
}

/* ─── Pagination ─────────────────────────────────────────────────────────── */

function PaginationBar({
  page,
  pageSize,
  total,
  onPageChange,
  rowLabel = "rows",
  layout = "compact",
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
}: IthTablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const pageButtons = useMemo(() => {
    const windowSize = 5;
    const half = Math.floor(windowSize / 2);
    let start = Math.max(1, page - half);
    const end = Math.min(totalPages, start + windowSize - 1);
    start = Math.max(1, end - windowSize + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages]);

  if (layout === "full") {
    const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, total);

    const btnClass =
      "rounded-md border border-ithina-border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-slate-400 transition-colors hover:border-ithina-purple/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-30";

    return (
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-ithina-border/40 bg-ithina-bg/40 px-4 py-3 sm:px-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">
          Showing {start}–{end} of {total} rows
        </span>
        <div className="flex flex-wrap items-center gap-3">
          {onPageSizeChange ? (
            <label className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-slate-500">
              Page size
              <select
                value={pageSize}
                onChange={(e) => {
                  onPageSizeChange(Number(e.target.value));
                  onPageChange(1);
                }}
                className="rounded-md border border-ithina-border bg-ithina-panel px-2 py-1 text-xs text-white"
              >
                {pageSizeOptions.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <div className="flex flex-wrap items-center gap-1">
            <button type="button" disabled={page <= 1} onClick={() => onPageChange(1)} className={btnClass}>
              First
            </button>
            <button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)} className={btnClass}>
              Prev
            </button>
            {pageButtons.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className={cn(
                  "flex min-w-8 items-center justify-center rounded-md border px-2 py-1 font-mono text-[11px] transition-colors",
                  p === page
                    ? "border-ithina-purple/30 bg-ithina-purple/10 text-ithina-purple"
                    : "border-ithina-border text-slate-500 hover:border-ithina-purple/30 hover:text-white",
                )}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className={btnClass}
            >
              Next
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => onPageChange(totalPages)}
              className={btnClass}
            >
              Last
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex shrink-0 items-center justify-between border-t border-ithina-border/40 bg-ithina-bg/40 px-6 py-2.5">
      <span className="font-mono text-[11px] text-slate-600">
        {total} {rowLabel}
      </span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="flex size-7 items-center justify-center rounded border border-ithina-border text-xs text-slate-500 transition-colors hover:border-ithina-purple/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Previous page"
        >
          ←
        </button>
        {pageButtons.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={cn(
              "flex size-7 items-center justify-center rounded border font-mono text-[11px] transition-colors",
              p === page
                ? "border-ithina-purple/30 bg-ithina-purple/10 text-ithina-purple"
                : "border-ithina-border text-slate-500 hover:border-ithina-purple/30 hover:text-white",
            )}
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="flex size-7 items-center justify-center rounded border border-ithina-border text-xs text-slate-500 transition-colors hover:border-ithina-purple/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Next page"
        >
          →
        </button>
      </div>
    </div>
  );
}

/* ─── Main IthTable ──────────────────────────────────────────────────────── */

export function IthTable<TRow extends object>({
  data,
  columns,
  rowKey,
  onRowClick,
  rowClassName,
  pagination,
  filterRow,
  empty,
  className,
  rowHighlight,
}: IthTableProps<TRow>) {
  const [sort, setSort] = useState<{ key: string; dir: SortDir }>({ key: "", dir: null });

  const sortedData = useMemo(() => {
    if (!sort.key || !sort.dir) return data;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortable || !col.field) return data;
    return [...data].sort((a, b) => {
      const cmp = String(a[col.field!] ?? "").localeCompare(String(b[col.field!] ?? ""), undefined, { numeric: true });
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }, [data, sort, columns]);

  const visibleRows = useMemo(() => {
    if (!pagination) return sortedData;
    const { page, pageSize } = pagination;
    return sortedData.slice((page - 1) * pageSize, page * pageSize);
  }, [sortedData, pagination]);

  const handleHeaderClick = (col: IthColumnDef<TRow>) => {
    if (!col.sortable) return;
    setSort((prev) => {
      if (prev.key !== col.key) return { key: col.key, dir: "asc" };
      if (prev.dir === "asc")   return { key: col.key, dir: "desc" };
      return { key: "", dir: null };
    });
  };

  return (
    <div className={cn("flex flex-col overflow-hidden rounded-xl border border-ithina-border", className)}>
      {/* Horizontal scroll wrapper — table can grow wider than container */}
      <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto">
        <table className="w-full border-collapse" style={{ minWidth: "max-content" }}>

          {/* ── Header ── exactly matches ai_studio_code: rgba(15,21,35,.95) + blur(4px) ── */}
          <thead
            className="sticky top-0 z-10"
            style={{ background: "rgba(15,21,35,0.95)", backdropFilter: "blur(4px)" }}
          >
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleHeaderClick(col)}
                  className={cn(
                    /* design system th-base — font-mono 10px uppercase tracking-widest text-slate-500
                       px-5 py-3 border-b border-ithina-border, no background override */
                    "px-5 py-3 text-left align-middle",
                    "font-mono text-[10px] font-normal uppercase tracking-widest text-slate-500",
                    "border-b border-ithina-border whitespace-nowrap",
                    col.width,
                    ALIGN_TH[col.align ?? "left"],
                    col.sortable && "group cursor-pointer select-none hover:text-slate-300",
                  )}
                >
                  {col.headerRender ? (
                    col.headerRender()
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {col.sortable && <SortIcon dir={sort.key === col.key ? sort.dir : null} />}
                    </span>
                  )}
                </th>
              ))}
            </tr>
            {filterRow && filterRow.length === columns.length ? (
              <tr className="border-b border-ithina-border bg-[rgba(15,21,35,0.88)] backdrop-blur-sm">
                {filterRow.map((cell, i) => (
                  <td key={i} className="px-3 py-2 align-middle">
                    {cell}
                  </td>
                ))}
              </tr>
            ) : null}
          </thead>

          {/* ── Body ── */}
          <tbody>
            {visibleRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    {empty?.icon && (
                      <div className="flex size-10 items-center justify-center rounded-full bg-white/5">
                        {empty.icon}
                      </div>
                    )}
                    <p className="font-mono text-xs text-slate-600">
                      {empty?.message ?? "No data to display."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              visibleRows.map((row, idx) => {
                const highlight = rowHighlight?.(row);
                return (
                  <tr
                    key={rowKey(row)}
                    onClick={(e) => onRowClick?.(row, e)}
                    className={cn(
                      /* design system tbody tr */
                      "border-b border-ithina-border/40 transition-colors last:border-none",
                      "hover:bg-white/[0.018]",
                      onRowClick && "cursor-pointer",
                      highlight && HIGHLIGHT_CLASS[highlight],
                      rowClassName?.(row),
                    )}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          /* design system td — padding: 14px 20px, text-[13px] text-slate-400 */
                          "px-5 py-[14px] align-middle text-[13px] text-slate-400 tabular-nums",
                          ALIGN_TD[col.align ?? "left"],
                        )}
                      >
                        {col.render
                          ? col.render(row, idx)
                          : col.field != null
                            ? String(row[col.field] ?? "—")
                            : "—"}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {pagination && <PaginationBar {...pagination} />}
    </div>
  );
}

/* ─── IthBadge (design system §2.2) ─────────────────────────────────────── */

type BadgeVariant = "purple" | "emerald" | "amber" | "rose" | "slate";

const BADGE_VARIANT: Record<BadgeVariant, string> = {
  purple:  "text-ithina-purple bg-ithina-purple/10 border-ithina-purple/20",
  /** POG success / admin users “Active”: chart-2 emerald (#34d399 family via theme) */
  emerald: "text-chart-2 bg-chart-2/10 border-chart-2/20",
  amber:   "text-amber-400   bg-amber-400/10      border-amber-400/20",
  rose:    "text-rose-400    bg-rose-400/10       border-rose-400/20",
  slate:   "text-muted-foreground bg-muted/10 border-border/30",
};

export interface IthBadgeProps {
  label: string;
  variant: BadgeVariant;
  dot?: boolean;
  pulse?: boolean;
  className?: string;
  /**
   * `mono` = compact uppercase table chips (default).
   * `sans` = POG Users table style: text-xs font-semibold, title case, rounded-md pill.
   */
  typography?: "mono" | "sans";
}

export function IthBadge({ label, variant, dot, pulse, className, typography = "mono" }: IthBadgeProps) {
  const sans = typography === "sans";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border px-2 py-0.5",
        sans ? "rounded-md font-sans text-xs font-semibold tracking-normal" : "rounded font-mono text-[9px] uppercase tracking-widest",
        BADGE_VARIANT[variant],
        className,
      )}
    >
      {dot && (
        <span
          className={cn(
            "inline-block shrink-0 rounded-full bg-current",
            sans ? "size-2" : "size-1.5",
            pulse && "animate-pulse",
          )}
          aria-hidden
        />
      )}
      {label}
    </span>
  );
}

/* ─── IthPrimaryCell (design system §2.4 stacked pattern) ───────────────── */

export interface IthPrimaryCellProps {
  primary: string;
  secondary?: string;
  secondaryMono?: boolean;
}

export function IthPrimaryCell({ primary, secondary, secondaryMono = true }: IthPrimaryCellProps) {
  return (
    <div>
      <p className="text-[13px] font-semibold leading-tight text-white">{primary}</p>
      {secondary && (
        <p className={cn("mt-0.5 text-[10px] text-slate-500", secondaryMono && "font-mono")}>
          {secondary}
        </p>
      )}
    </div>
  );
}
