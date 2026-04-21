/**
 * DataTable — canonical Tabulator wrapper for Promo.
 *
 * Mirrors POG's DataTable (DD-POG-Frontend/src/components/ui/data-table.tsx):
 *   - Dark-theme CSS is injected globally via index.css (.data-table-wrapper)
 *   - Only the minimal tabulator_simple base is imported here (no opinionated light theme)
 *   - Supports bulk selection, groupBy, dataTree, row numbers, resize/redraw observers
 */

import { useEffect, useRef } from "react";
import { TabulatorFull } from "tabulator-tables";

import "tabulator-tables/dist/css/tabulator_simple.min.css";

import { cn } from "@/lib/utils";

/** Tabulator `rowSelection` header `selectRow` range — see RowManager.getRows(type). */
export type DataTableBulkSelectRowRange = "active" | "display" | "visible";

/** Typed cell accessor passed to column `formatter` and `cellClick` callbacks. */
export interface DataTableCell<T = object> {
  getData: () => T;
  getValue: () => unknown;
  getElement: () => HTMLElement;
}

/** Column definition — a typed subset of Tabulator's ColumnDefinition. */
export interface DataTableColumn<T = object> {
  /** Column header label */
  title: string;
  /** Row-data field key */
  field: keyof T | string;
  sorter?: "string" | "number" | "alphanum" | "boolean" | "date" | "time" | "datetime";
  width?: number | string;
  minWidth?: number;
  /** Return an HTML string, HTMLElement, or false (shows nothing) */
  formatter?: (cell: DataTableCell<T>) => string | HTMLElement | false;
  /** Cell click handler; receives the native MouseEvent + typed cell accessor */
  cellClick?: (e: MouseEvent, cell: DataTableCell<T>) => void;
  headerSort?: boolean;
  /** "input" | "number" | "list" | false (disable) | true (default "input") */
  headerFilter?: "input" | "number" | "list" | boolean;
  hozAlign?: "left" | "center" | "right";
  vertAlign?: "top" | "middle" | "bottom";
  headerHozAlign?: "left" | "center" | "right";
  /** Pass-through for any Tabulator column option not listed above */
  [key: string]: unknown;
}

export interface DataTableProps<T = object> {
  /** Column definitions */
  columns: DataTableColumn<T>[];
  /** Row data */
  data: T[];
  /** Row click handler (skipped when target is a button/select/link) */
  onRowClick?: (row: T, event: unknown) => void;
  /** Field used as unique row index (default: "id") */
  rowIdField?: keyof T | string;
  /** Extra class name on the wrapper div */
  className?: string;
  /** Initial sort column and direction */
  initialSort?: { field: keyof T | string; dir: "asc" | "desc" };
  /** Placeholder text when data is empty (default: "No data") */
  emptyMessage?: string;
  /** Show per-column header filter inputs (default: true) */
  headerFilters?: boolean;
  /** Enable built-in Tabulator pagination (default: true) */
  pagination?: boolean;
  /** Rows per page (default: 10) */
  pageSize?: number;
  /** Page-size selector options (default: [5, 10, 20, 50]) */
  pageSizeSelector?: number[] | true;
  /** Tabulator layout mode (default: "fitColumns") */
  layout?: "fitColumns" | "fitData" | "fitDataFill" | "fitDataStretch" | "fitDataTable";
  /** Allow drag-to-reorder columns (default: false) */
  movableColumns?: boolean;
  resizableColumns?: boolean;
  resizableColumnFit?: boolean;
  /** Callback on page or page-size change */
  onPaginationChange?: (state: { page: number; pageSize: number }) => void;
  /** Row formatter — receives Tabulator row, can add classes etc. */
  rowFormatter?: (row: { getData: () => T; getElement: () => HTMLElement }) => void;
  /** Show serial-number "No." column as first column (default: true) */
  showRowNumber?: boolean;

  /** Enable bulk row selection with checkboxes (default: false) */
  isBulkEnabled?: boolean;
  /** Callback fired when bulk selection changes */
  onSelectionChange?: (rows: T[]) => void;
  /**
   * Header “select all” row set for Tabulator `rowSelection`.
   * Default: `"display"` when `pagination` is on (current page), `"active"` when off (all filtered rows).
   */
  bulkSelectRowRange?: DataTableBulkSelectRowRange;

  /** Group rows by field name or accessor function */
  groupBy?: string | ((row: T) => string);
  /** Custom group header renderer */
  groupHeader?: (value: string, count: number, data: T[], group: unknown) => string | HTMLElement;
  /** Start groups expanded (default: true) */
  groupStartOpen?: boolean;
  /** Group toggle trigger area: "arrow" | "header" (default: "header") */
  groupToggleElement?: "arrow" | "header";

  /** Enable tree structure (default: false) */
  dataTree?: boolean;
  /** Field name for child rows (default: "_children") */
  dataTreeChildField?: string;
  /** Start with tree collapsed (default: false) */
  dataTreeStartExpanded?: boolean;
  /** Column that shows the tree toggle (default: first column) */
  dataTreeElementColumn?: string;
  /** Shrink wrapper height to content (no default min-heights; for compact admin lists) */
  fitContent?: boolean;
}

/** Tabulator's bundled types omit some runtime instance APIs */
type TabulatorGrid = TabulatorFull & {
  redraw: (full?: boolean) => void;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
};

/**
 * Module-level default so the value has a stable reference across renders.
 * Previously this was an inline default (`= [5, 10, 20, 50]`) which produced
 * a new array on every render and, since `pageSizeSelector` is in the main
 * `useEffect` deps, caused the Tabulator grid to be destroyed and rebuilt on
 * every parent re-render — including the one triggered by `onSelectionChange`
 * after a checkbox click, which wiped the selection.
 */
const DEFAULT_PAGE_SIZE_SELECTOR: readonly number[] = [5, 10, 20, 50];

export function DataTable<T extends object>({
  columns,
  data,
  onRowClick,
  rowIdField = "id",
  className,
  initialSort,
  emptyMessage = "No data",
  headerFilters = true,
  pagination = true,
  pageSize = 10,
  pageSizeSelector = DEFAULT_PAGE_SIZE_SELECTOR as number[],
  layout = "fitColumns",
  movableColumns = false,
  resizableColumns = true,
  resizableColumnFit = false,
  onPaginationChange,
  rowFormatter,
  showRowNumber = true,
  isBulkEnabled = false,
  onSelectionChange,
  bulkSelectRowRange,
  groupBy,
  groupHeader,
  groupStartOpen = true,
  groupToggleElement = "header",
  dataTree = false,
  dataTreeChildField = "_children",
  dataTreeStartExpanded = false,
  dataTreeElementColumn,
  fitContent = false,
}: DataTableProps<T>) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<TabulatorGrid | null>(null);
  const tableGenerationRef = useRef(0);
  const currentPageRef = useRef(1);
  const currentPageSizeRef = useRef(pageSize);

  useEffect(() => {
    if (!containerRef.current) return;

    currentPageRef.current = 1;
    currentPageSizeRef.current = pageSize;

    const rowIdKey = String(rowIdField);

    const resolvedBulkRowRange: DataTableBulkSelectRowRange =
      bulkSelectRowRange ?? (pagination ? "display" : "active");

    const tabulatorColumns = columns.map((col) => ({
      ...col,
      field: col.field as string,
      headerSort: col.headerSort !== false,
      headerFilter: headerFilters ? (col.headerFilter ?? "input") : false,
      hozAlign: col.hozAlign ?? ("center" as const),
      vertAlign: col.vertAlign ?? ("middle" as const),
      headerHozAlign: col.headerHozAlign ?? ("center" as const),
    }));

    const serialColumn = {
      title: "No.",
      field: "__rowNum__",
      width: 56,
      minWidth: 48,
      headerSort: false,
      headerFilter: false,
      headerHozAlign: "center" as const,
      formatter: "rownum" as const,
      formatterParams: { relativeToPage: true },
      hozAlign: "center" as const,
      vertAlign: "middle" as const,
    };

    const selectionColumn = isBulkEnabled
      ? {
          title: "",
          field: "__select__",
          width: 40,
          headerSort: false,
          headerFilter: false,
          hozAlign: "center" as const,
          headerHozAlign: "center" as const,
          vertAlign: "middle" as const,
          formatter: "rowSelection" as const,
          titleFormatter: "rowSelection" as const,
          titleFormatterParams: { rowRange: resolvedBulkRowRange },
        }
      : null;

    const finalColumns = [
      ...(selectionColumn ? [selectionColumn] : []),
      ...(showRowNumber ? [serialColumn] : []),
      ...tabulatorColumns,
    ];

    const options: Record<string, unknown> = {
      data: data.map((row) => ({ ...row })),
      columns: finalColumns,
      layout,
      responsiveLayout: false,
      resizableColumns,
      resizableColumnFit,
      movableColumns,
      placeholder: emptyMessage,
      index: rowIdKey,
    };

    if (dataTree) {
      options.dataTree = true;
      options.dataTreeChildField = dataTreeChildField;
      options.dataTreeStartExpanded = dataTreeStartExpanded;
      if (dataTreeElementColumn) options.dataTreeElementColumn = dataTreeElementColumn;
    }

    if (groupBy) {
      options.groupBy = groupBy;
      options.groupStartOpen = groupStartOpen;
      options.groupToggleElement = groupToggleElement;
      if (groupHeader) options.groupHeader = groupHeader;
    }

    if (pagination) {
      options.pagination = "local";
      options.paginationSize = pageSize;
      options.paginationSizeSelector = pageSizeSelector;
      options.paginationCounter = "rows";
      options.pageLoaded = (page: number) => {
        currentPageRef.current = page;
        onPaginationChange?.({ page, pageSize: currentPageSizeRef.current });
      };
      options.pageSizeChanged = (size: number) => {
        currentPageSizeRef.current = size;
        onPaginationChange?.({ page: currentPageRef.current, pageSize: size });
      };
    }

    if (initialSort) {
      options.initialSort = [{ column: String(initialSort.field), dir: initialSort.dir }];
    }

    if (isBulkEnabled) {
      options.selectableRows = true;
      // "click" mode wires checkbox clicks to handleComplexRowClick(), which for a
      // plain click does deselect-all-then-select-one — so only one row can stay
      // selected when using checkboxes. "drag" mode leaves checkboxes to the
      // change handler only (toggleSelect), which supports multi-select. Shift/Ctrl
      // range selection on the row strip still works where Tabulator applies it.
      options.selectableRowsRangeMode = "drag";
    }

    const effectiveRowFormatter = rowFormatter
      ? (row: { getData: () => T; getElement: () => HTMLElement }) => {
          rowFormatter(row);
          if (onRowClick) row.getElement().classList.add("cursor-pointer");
        }
      : onRowClick
        ? (row: { getElement: () => HTMLElement }) => row.getElement().classList.add("cursor-pointer")
        : undefined;
    if (effectiveRowFormatter) options.rowFormatter = effectiveRowFormatter;

    const table = new TabulatorFull(containerRef.current, options as never) as TabulatorGrid;
    tableRef.current = table;
    tableGenerationRef.current += 1;

    // Debounced redraw. Without this, long-running layout changes such as the
    // sidebar collapse/expand CSS transition cause the ResizeObserver on the
    // wrapper to fire on every animation frame, and each tick runs a full
    // `table.redraw(true)` — a very expensive relayout for tables with many
    // rows / custom HTML formatters. Debouncing ensures we do one redraw after
    // the container has settled, eliminating the jank while still keeping the
    // grid crisp after resizes.
    let redrawRafId = 0;
    let redrawTimer: ReturnType<typeof setTimeout> | null = null;

    const scheduleRedraw = () => {
      if (redrawTimer) clearTimeout(redrawTimer);
      redrawTimer = setTimeout(() => {
        if (redrawRafId) cancelAnimationFrame(redrawRafId);
        redrawRafId = requestAnimationFrame(() => {
          const t = tableRef.current;
          const c = containerRef.current;
          if (!t || !c?.isConnected) return;
          try { t.redraw(true); } catch { /* ignore transient DOM teardown */ }
        });
      }, 120);
    };

    const wrapper = wrapperRef.current;
    let resizeObserver: ResizeObserver | undefined;
    if (wrapper && typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(scheduleRedraw);
      resizeObserver.observe(wrapper);
    }
    window.addEventListener("resize", scheduleRedraw);
    table.on("columnResized", scheduleRedraw);
    if (movableColumns) table.on("columnMoved", scheduleRedraw);

    if (onRowClick) {
      (table as never as {
        on: (event: string, callback: (e: unknown, row: { getData: () => T }) => void) => void;
      }).on("rowClick", (e: unknown, row: { getData: () => T }) => {
        const ev = e as { target?: EventTarget };
        const target = ev?.target as HTMLElement | null;
        if (target?.closest?.("button, select, [data-action], a[href]")) return;
        onRowClick(row.getData(), e);
      });
    }

    if (isBulkEnabled && onSelectionChange) {
      (table as never as {
        on: (event: string, callback: (rows: T[]) => void) => void;
      }).on("rowSelectionChanged", (rows: T[]) => {
        onSelectionChange(rows);
      });
    }

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", scheduleRedraw);
      if (redrawTimer) clearTimeout(redrawTimer);
      if (redrawRafId) cancelAnimationFrame(redrawRafId);
      table.destroy();
      tableRef.current = null;
    };
  }, [
    columns,
    onRowClick,
    rowIdField,
    initialSort,
    emptyMessage,
    headerFilters,
    pagination,
    pageSize,
    pageSizeSelector,
    layout,
    movableColumns,
    resizableColumns,
    resizableColumnFit,
    onPaginationChange,
    rowFormatter,
    showRowNumber,
    isBulkEnabled,
    onSelectionChange,
    groupBy,
    groupHeader,
    groupStartOpen,
    groupToggleElement,
    dataTree,
    dataTreeChildField,
    dataTreeStartExpanded,
    dataTreeElementColumn,
    bulkSelectRowRange,
  ]);

  // Keep row data updates cheap — separate from the column/options effect.
  useEffect(() => {
    const rows = data.map((row) => ({ ...row }));
    let cancelled = false;
    const gen = tableGenerationRef.current;

    const apply = () => {
      if (cancelled || tableGenerationRef.current !== gen) return;
      const table = tableRef.current;
      const container = containerRef.current;
      if (!table || !container?.isConnected) return;
      try {
        void Promise.resolve(table.setData(rows)).then(() => {
          if (cancelled || tableGenerationRef.current !== gen) return;
          if (tableRef.current !== table) return;
          if (!containerRef.current?.isConnected) return;
          requestAnimationFrame(() => {
            if (cancelled || tableGenerationRef.current !== gen) return;
            if (tableRef.current !== table) return;
            try { table.redraw(true); } catch { /* ignore */ }
          });
        });
      } catch { /* setData can throw on destroyed grid */ }
    };

    queueMicrotask(apply);
    return () => { cancelled = true; };
  }, [data]);

  return (
    <div
      ref={wrapperRef}
      className={cn(
        "data-table-wrapper min-w-0 w-full max-w-full rounded-lg border border-border bg-card overflow-x-auto overflow-y-hidden",
        fitContent ? "h-auto !min-h-0" : "min-h-[280px]",
        className,
      )}
      role="region"
      aria-label="Data table"
      data-fit-content={fitContent ? "true" : undefined}
    >
      <div
        ref={containerRef}
        className={cn(
          "data-table-container w-full min-w-0 max-w-full overflow-x-auto",
          fitContent ? "h-auto !min-h-0" : "h-full min-h-[200px]",
        )}
      />
    </div>
  );
}
