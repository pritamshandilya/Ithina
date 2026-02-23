/**
 * DataTable Component
 *
 * Reusable table built on Tabulator. Configure via columns and data;
 * columns can be extended with formatters, sorters, and other Tabulator options.
 */

import { useEffect, useRef } from "react";
import { TabulatorFull } from "tabulator-tables";

import "tabulator-tables/dist/css/tabulator.css";

import { cn } from "@/lib/utils";

/**
 * Minimal column definition for DataTable.
 * Extend with any Tabulator column options (formatter, sorter, width, etc.)
 */
export interface DataTableColumn<T = object> {
  /** Column header title */
  title: string;
  /** Field key in the row data */
  field: keyof T | string;
  /** Optional Tabulator sorter type */
  sorter?: "string" | "number" | "alphanum" | "boolean" | "date" | "time" | "datetime";
  /** Optional width (e.g. "120px" or 120) */
  width?: number | string;
  /** Optional min width */
  minWidth?: number;
  /** Optional formatter - Tabulator passes cell component; return HTML string or HTMLElement */
  formatter?: (cell: unknown) => string | HTMLElement | false;
  /** Optional header sort */
  headerSort?: boolean;
  /** Header filter type: "input" | "number" | "list" etc.; set false to disable for this column */
  headerFilter?: "input" | "number" | "list" | boolean;
  [key: string]: unknown;
}

export interface DataTableProps<T = object> {
  /** Column definitions (title, field, and optional formatter/sorter/width) */
  columns: DataTableColumn<T>[];
  /** Row data */
  data: T[];
  /** Optional row click handler; receives row data */
  onRowClick?: (row: T) => void;
  /** Optional field name used as unique row id (default: "id") */
  rowIdField?: keyof T | string;
  /** Optional class name for the wrapper div */
  className?: string;
  /** Optional initial sort: { field, dir: "asc" | "desc" } */
  initialSort?: { field: keyof T | string; dir: "asc" | "desc" };
  /** Optional placeholder when data is empty */
  emptyMessage?: string;
  /** Enable header filter row (default: true) */
  headerFilters?: boolean;
  /** Enable pagination (default: true) */
  pagination?: boolean;
  /** Rows per page when pagination enabled (default: 10) */
  pageSize?: number;
  /** Page size options for selector; set true for default [5,10,20,50] */
  pageSizeSelector?: number[] | true;
  /** Optional table layout mode (default: "fitColumns") */
  layout?: "fitColumns" | "fitData" | "fitDataFill" | "fitDataStretch" | "fitDataTable";
  /** Enable column dragging to reorder (default: false) */
  movableColumns?: boolean;
  /** Optional pagination state callback for visible-count UI */
  onPaginationChange?: (state: { page: number; pageSize: number }) => void;
  /** Optional row formatter - receives Tabulator row, can add classes etc. */
  rowFormatter?: (row: { getData: () => T; getElement: () => HTMLElement }) => void;
  /** Enable tree structure (default: false) */
  dataTree?: boolean;
  /** Field name for child rows in tree structure (default: "_children") */
  dataTreeChildField?: string;
  /** Start with tree collapsed (default: false) */
  dataTreeStartExpanded?: boolean;
  /** Column to show tree toggle (default: first column) */
  dataTreeElementColumn?: string;
  /** Show serial number column "No." as first column (default: true) */
  showRowNumber?: boolean;
}

/**
 * DataTable
 *
 * Renders a Tabulator table with app-themed styling. Use by passing
 * columns and data; override columns per usage (e.g. different columns for
 * shelves vs audits).
 */
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
  pageSizeSelector = [5, 10, 20, 50],
  layout = "fitColumns",
  movableColumns = false,
  onPaginationChange,
  rowFormatter,
  dataTree = false,
  dataTreeChildField = "_children",
  dataTreeStartExpanded = false,
  dataTreeElementColumn,
  showRowNumber = true,
}: DataTableProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<TabulatorFull | null>(null);
  const currentPageRef = useRef(1);
  const currentPageSizeRef = useRef(pageSize);

  useEffect(() => {
    if (!containerRef.current) return;

    currentPageRef.current = 1;
    currentPageSizeRef.current = pageSize;

    const rowIdKey = String(rowIdField);
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

    const finalColumns = showRowNumber
      ? [serialColumn, ...tabulatorColumns]
      : tabulatorColumns;

    const options: Record<string, unknown> = {
      data: [...data],
      columns: finalColumns,
      layout,
      responsiveLayout: "hide",
      resizableColumns: true,
      resizableColumnFit: true,
      movableColumns,
      placeholder: emptyMessage,
      index: rowIdKey,
    };

    if (dataTree) {
      options.dataTree = true;
      options.dataTreeChildField = dataTreeChildField;
      options.dataTreeStartExpanded = dataTreeStartExpanded;
      if (dataTreeElementColumn) {
        options.dataTreeElementColumn = dataTreeElementColumn;
      }
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

    const effectiveRowFormatter = rowFormatter
      ? (row: { getData: () => T; getElement: () => HTMLElement }) => {
          rowFormatter(row);
          if (onRowClick) row.getElement().classList.add("cursor-pointer");
        }
      : onRowClick
        ? (row: { getElement: () => HTMLElement }) => row.getElement().classList.add("cursor-pointer")
        : undefined;
    if (effectiveRowFormatter) {
      options.rowFormatter = effectiveRowFormatter;
    }

    tableRef.current = new TabulatorFull(containerRef.current, options as never);

    if (onRowClick) {
      (tableRef.current as never as { on: (event: string, callback: (e: unknown, row: { getData: () => T }) => void) => void }).on("rowClick", (e: unknown, row: { getData: () => T }) => {
        const ev = e as { target?: EventTarget };
        const target = ev?.target as HTMLElement | null;
        if (target?.closest?.("button, select, [data-action], a[href]")) return;
        onRowClick(row.getData());
      });
    }

    return () => {
      tableRef.current?.destroy();
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
    onPaginationChange,
    rowFormatter,
    data,
    dataTree,
    dataTreeChildField,
    dataTreeStartExpanded,
    dataTreeElementColumn,
    showRowNumber,
  ]);

  // Keep row updates cheap when only data changes.
  useEffect(() => {
    if (tableRef.current) {
      tableRef.current.setData(data);
    }
  }, [data]);

  return (
    <div
      className={cn(
        "data-table-wrapper w-full min-h-[280px] rounded-lg border border-border bg-card overflow-x-auto overflow-y-hidden",
        className
      )}
      role="region"
      aria-label="Data table"
    >
      <div ref={containerRef} className="data-table-container h-full w-full" />
    </div>
  );
}
