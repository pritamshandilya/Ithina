import { useEffect, useRef } from "react";
import { TabulatorFull } from "tabulator-tables";

import "tabulator-tables/dist/css/tabulator.css";

import { cn } from "@/lib/utils";

export interface DataTableColumn<T = object> {
  title: string;
  field: keyof T | string;
  sorter?: "string" | "number" | "alphanum" | "boolean" | "date" | "time" | "datetime";
  width?: number | string;
  minWidth?: number;
  formatter?: (cell: unknown) => string | HTMLElement | false;
  headerSort?: boolean;
  headerFilter?: "input" | "number" | "list" | boolean;
  hozAlign?: "left" | "center" | "right";
  vertAlign?: "top" | "middle" | "bottom";
  headerHozAlign?: "left" | "center" | "right";
  cellClick?: (e: MouseEvent, cell: { getData: () => T }) => void;
  [key: string]: unknown;
}

export interface DataTableProps<T = object> {
  columns: DataTableColumn<T>[];
  data: T[];
  onRowClick?: (row: T, event: unknown) => void;
  rowIdField?: keyof T | string;
  className?: string;
  initialSort?: { field: keyof T | string; dir: "asc" | "desc" };
  emptyMessage?: string;
  headerFilters?: boolean;
  pagination?: boolean;
  pageSize?: number;
  pageSizeSelector?: number[] | true;
  layout?: "fitColumns" | "fitData" | "fitDataFill" | "fitDataStretch" | "fitDataTable";
  movableColumns?: boolean;
  resizableColumns?: boolean;
  resizableColumnFit?: boolean;
  onPaginationChange?: (state: { page: number; pageSize: number }) => void;
  rowFormatter?: (row: { getData: () => T; getElement: () => HTMLElement }) => void;
  showRowNumber?: boolean;
}

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
  resizableColumns = true,
  resizableColumnFit = false,
  onPaginationChange,
  rowFormatter,
  showRowNumber = true,
}: DataTableProps<T>) {
  const wrapperRef = useRef<HTMLDivElement>(null);
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

    const table = new TabulatorFull(containerRef.current, options as never);
    tableRef.current = table;

    const scheduleRedraw = () => {
      requestAnimationFrame(() => {
        const t = tableRef.current;
        const c = containerRef.current;
        if (!t || !c?.isConnected) return;
        try {
          t.redraw(true);
        } catch {
          /* Tabulator can throw if the grid DOM was torn down mid-redraw */
        }
      });
    };

    const wrapper = wrapperRef.current;
    let resizeObserver: ResizeObserver | undefined;
    if (wrapper && typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(scheduleRedraw);
      resizeObserver.observe(wrapper);
    }

    const onWindowResize = () => scheduleRedraw();
    window.addEventListener("resize", onWindowResize);

    table.on("columnResized", scheduleRedraw);
    if (movableColumns) {
      table.on("columnMoved", scheduleRedraw);
    }

    if (onRowClick) {
      (table as never as { on: (event: string, callback: (e: unknown, row: { getData: () => T }) => void) => void }).on("rowClick", (e: unknown, row: { getData: () => T }) => {
        const ev = e as { target?: EventTarget };
        const target = ev?.target as HTMLElement | null;
        if (target?.closest?.("button, select, [data-action], a[href]")) return;
        onRowClick(row.getData(), e);
      });
    }

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", onWindowResize);
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
  ]);

  useEffect(() => {
    const table = tableRef.current;
    const container = containerRef.current;
    if (!table || !container?.isConnected) return;

    let cancelled = false;

    void Promise.resolve(table.setData(data.map((row) => ({ ...row })))).then(() => {
      if (cancelled) return;
      requestAnimationFrame(() => {
        if (cancelled) return;
        if (tableRef.current !== table) return;
        if (!containerRef.current?.isConnected) return;
        try {
          table.redraw(true);
        } catch {
          /* Same as scheduleRedraw: avoid offsetWidth / layout reads on detached nodes */
        }
      });
    });

    return () => {
      cancelled = true;
    };
  }, [data]);

  return (
    <div
      ref={wrapperRef}
      className={cn(
        "data-table-wrapper min-w-0 w-full min-h-[280px] rounded-lg border border-border bg-card overflow-x-auto overflow-y-hidden",
        className
      )}
      role="region"
      aria-label="Data table"
    >
      <div ref={containerRef} className="data-table-container h-full min-h-[200px] w-full min-w-0" />
    </div>
  );
}
