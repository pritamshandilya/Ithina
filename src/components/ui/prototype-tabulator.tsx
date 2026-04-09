import "tabulator-tables/dist/css/tabulator.min.css";

import { useEffect, useRef, useState } from "react";
import { TabulatorFull } from "tabulator-tables";

import { cn } from "@/lib/utils";

type TabulatorWithInit = TabulatorFull & { initialized?: boolean };

type TabulatorEventHost = {
  on: (name: string, cb: (...args: unknown[]) => void) => void;
};

export type PrototypeTabulatorColumn<T extends object> = {
  title: string;
  field: keyof T | string;
  sorter?: "string" | "number" | "alphanum" | "boolean" | "date" | "time" | "datetime";
  width?: number | string;
  minWidth?: number;
  maxWidth?: number;
  /** Tabulator: column receives extra width when using layout fitColumns */
  widthGrow?: number;
  cssClass?: string;
  headerSort?: boolean;
  headerFilter?: boolean | "input" | "number" | "list" | "boolean";
  hozAlign?: "left" | "center" | "right";
  vertAlign?: "top" | "middle" | "bottom";
  headerHozAlign?: "left" | "center" | "right";
  frozen?: boolean;
  resizable?: boolean;
  formatter?: (cell: any) => string | HTMLElement | false;
  cellClick?: (e: MouseEvent, cell: any) => void;
};

export interface PrototypeTabulatorProps<T extends object> {
  columns: PrototypeTabulatorColumn<T>[];
  data: T[];
  rowIdField?: keyof T | string;
  emptyMessage?: string;

  /** Enable built-in Tabulator pagination */
  pagination?: boolean;
  pageSize?: number;
  pageSizeSelector?: number[] | true | false;

  /** Enable virtual DOM rendering for large datasets (thousands of rows) */
  virtualDom?: boolean;
  /** Row height hint for virtual DOM (px). Default 40. */
  virtualDomRowHeight?: number;

  initialSort?: { field: keyof T | string; dir: "asc" | "desc" };
  layout?: "fitColumns" | "fitData" | "fitDataFill" | "fitDataStretch" | "fitDataTable";

  /** Allow columns to be resized by dragging. Default false. */
  resizableColumns?: boolean;
  movableColumns?: boolean;

  className?: string;
  tableHeight?: string | number;

  /** Bump to force row re-render without data identity change */
  formatRevision?: string | number;
  rowFormatter?: (row: T, el: HTMLElement) => void;

  headerCheckbox?: {
    checked: boolean;
    indeterminate: boolean;
    onChange: (checked: boolean) => void;
    selector?: string;
  };

  onCellClick?: (e: MouseEvent, row: T, cell: any) => void;
  onRowClick?: (e: MouseEvent, row: T) => void;
}

function toTabulatorColumnDefs<T extends object>(cols: PrototypeTabulatorColumn<T>[]) {
  return cols.map((col) => ({
    title: col.title,
    field: col.field as string,
    headerSort: col.headerSort !== false,
    headerFilter: col.headerFilter ?? false,
    hozAlign: col.hozAlign ?? ("center" as const),
    vertAlign: col.vertAlign ?? ("middle" as const),
    // Default to the same alignment as body cells for consistent header/row visuals.
    headerHozAlign: (col.headerHozAlign ?? col.hozAlign ?? ("center" as const)) as
      | "left"
      | "center"
      | "right",
    width: col.width,
    minWidth: col.minWidth,
    maxWidth: col.maxWidth,
    widthGrow: col.widthGrow,
    cssClass: col.cssClass,
    sorter: col.sorter,
    frozen: col.frozen,
    resizable: col.resizable,
    formatter: col.formatter ? (cell: any) => col.formatter?.(cell) : undefined,
    cellClick: col.cellClick
      ? (_e: MouseEvent, cell: any) => col.cellClick?.(_e, cell)
      : undefined,
  }));
}

/**
 * PrototypeTabulator — production-grade reusable virtual-scroll table.
 *
 * Features:
 *  • Virtual DOM rendering (virtualDom=true) for thousands of rows with no lag
 *  • Resizable columns (resizableColumns=true)
 *  • Frozen (pinned) columns via column.frozen
 *  • Built-in server-friendly pagination
 *  • Sticky themed header matching the ithina design system
 *  • Row-click handler
 *  • Header checkbox for bulk selection
 *  • Typed column definitions
 */
export function PrototypeTabulator<T extends object>({
  columns,
  data,
  rowIdField = "id",
  emptyMessage = "No data",
  pagination = false,
  pageSize = 25,
  pageSizeSelector = false,
  virtualDom = false,
  virtualDomRowHeight = 40,
  initialSort,
  layout = "fitColumns",
  resizableColumns = false,
  movableColumns = false,
  className,
  tableHeight,
  formatRevision,
  rowFormatter,
  headerCheckbox,
  onCellClick,
  onRowClick,
}: PrototypeTabulatorProps<T>) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tableRef = useRef<TabulatorFull | null>(null);
  const headerCheckboxCleanupRef = useRef<(() => void) | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const dataRef = useRef(data);
  dataRef.current = data;
  const rowFormatterRef = useRef(rowFormatter);
  rowFormatterRef.current = rowFormatter;

  const [tableBuiltGeneration, setTableBuiltGeneration] = useState(0);

  const isReady = (t: TabulatorFull | null): t is TabulatorWithInit =>
    Boolean(t && (t as TabulatorWithInit).initialized);

  const safeRedraw = () => {
    const el = containerRef.current;
    const t = tableRef.current;
    if (!el || !isReady(t) || !el.isConnected) return;
    try {
      (t as unknown as { redraw?: (f?: boolean) => void }).redraw?.(true);
    } catch { /* ignore transient redraw failures */ }
  };

  /* ── mount once ── */
  useEffect(() => {
    if (!containerRef.current) return;

    const idKey = String(rowIdField);
    const tabulatorRowFormatter = rowFormatterRef.current
      ? (row: { getData: () => T; getElement: () => HTMLElement }) => {
          rowFormatterRef.current?.(row.getData(), row.getElement());
        }
      : undefined;

    const options: Record<string, unknown> = {
      data: data.map((r) => ({ ...r })),
      columns: toTabulatorColumnDefs(columns),
      layout,
      responsiveLayout: false,
      resizableColumns,
      movableColumns,
      placeholder: emptyMessage,
      index: idKey,
      headerSortTristate: false,
      pagination,
      rowFormatter: tabulatorRowFormatter,
    };

    if (tableHeight !== undefined && tableHeight !== "") {
      options.height = tableHeight;
    }

    if (pagination) {
      options.paginationSize = pageSize;
      if (pageSizeSelector !== false) {
        options.paginationSizeSelector = pageSizeSelector;
      }
      options.paginationCounter = "rows";
    }

    if (virtualDom) {
      options.virtualDom = true;
      options.virtualDomRowHeight = virtualDomRowHeight;
    }

    if (initialSort) {
      options.initialSort = [{ column: String(initialSort.field), dir: initialSort.dir }];
    }

    const instance = new TabulatorFull(containerRef.current, options as never);
    tableRef.current = instance;

    let cancelled = false;
    (instance as unknown as TabulatorEventHost).on("tableBuilt", () => {
      if (!cancelled) setTableBuiltGeneration((g) => g + 1);
    });

    const observer = new ResizeObserver(() => requestAnimationFrame(() => safeRedraw()));
    observer.observe(containerRef.current);
    resizeObserverRef.current = observer;

    if (onCellClick) {
      (instance as unknown as TabulatorEventHost).on("cellClick", (e, cell) => {
        const c = cell as { getData?: () => T };
        onCellClick(e as MouseEvent, c?.getData?.() as T, c);
      });
    }

    if (onRowClick) {
      (instance as unknown as TabulatorEventHost).on("rowClick", (e, row) => {
        const r = row as { getData?: () => T };
        onRowClick(e as MouseEvent, r?.getData?.() as T);
      });
    }

    return () => {
      cancelled = true;
      headerCheckboxCleanupRef.current?.();
      headerCheckboxCleanupRef.current = null;
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;
      tableRef.current?.destroy();
      tableRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── sync data ── */
  useEffect(() => {
    if (!isReady(tableRef.current)) return;
    tableRef.current.setData(data.map((r) => ({ ...r })));
    safeRedraw();
  }, [data, tableBuiltGeneration]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── sync columns ── */
  useEffect(() => {
    const t = tableRef.current;
    if (!isReady(t)) return;
    (t as unknown as { setColumns?: (c: unknown) => void }).setColumns?.(
      toTabulatorColumnDefs(columns) as never,
    );
    t.setData(dataRef.current.map((r) => ({ ...r })));
    safeRedraw();
  }, [columns, tableBuiltGeneration]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── sync height ── */
  useEffect(() => {
    const t = tableRef.current;
    if (!isReady(t) || tableHeight === undefined) return;
    (t as unknown as { setHeight?: (h: unknown) => void }).setHeight?.(tableHeight as never);
    safeRedraw();
  }, [tableHeight, tableBuiltGeneration]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── force redraw on selection/format changes ── */
  useEffect(() => {
    if (!isReady(tableRef.current) || formatRevision === undefined) return;
    safeRedraw();
  }, [formatRevision, tableBuiltGeneration]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── header checkbox sync ── */
  useEffect(() => {
    headerCheckboxCleanupRef.current?.();
    headerCheckboxCleanupRef.current = null;
    if (!isReady(tableRef.current) || !containerRef.current || !headerCheckbox) return;

    const sel = headerCheckbox.selector ?? "[data-proto-header-checkbox='true']";
    const el = containerRef.current.querySelector(sel) as HTMLInputElement | null;
    if (!el) return;

    el.checked = headerCheckbox.checked;
    el.indeterminate = headerCheckbox.indeterminate;

    const handler = () => headerCheckbox.onChange(el.checked);
    el.addEventListener("change", handler);
    headerCheckboxCleanupRef.current = () => el.removeEventListener("change", handler);
  }, [headerCheckbox, columns, tableBuiltGeneration]);

  return (
    <div
      className={cn(
        "data-table-wrapper flex min-h-[200px] w-full min-h-0 flex-1 flex-col overflow-hidden",
        className,
      )}
      data-prototype="true"
      role="region"
      aria-label="Data table"
    >
      <div ref={containerRef} className="data-table-container min-h-0 flex-1" />
    </div>
  );
}
