import "tabulator-tables/dist/css/tabulator.min.css";

import { useEffect, useRef, useState } from "react";
import { TabulatorFull } from "tabulator-tables";

import { cn } from "@/lib/utils";

type TabulatorWithInit = TabulatorFull & { initialized?: boolean };

/** Narrow `.on` for SWC; inline `as never as { on: ... }` breaks the parser. */
type TabulatorEventHost = {
  on: (name: string, cb: (...args: unknown[]) => void) => void;
};

export type PrototypeTabulatorColumn<T extends object> = {
  title: string;
  field: keyof T | string;
  sorter?: "string" | "number" | "alphanum" | "boolean" | "date" | "time" | "datetime";
  width?: number | string;
  minWidth?: number;
  /** Applied to header and body cells for this column (Tabulator `cssClass`). */
  cssClass?: string;
  headerSort?: boolean;
  headerFilter?: boolean | "input" | "number" | "list" | "boolean";
  hozAlign?: "left" | "center" | "right";
  vertAlign?: "top" | "middle" | "bottom";
  headerHozAlign?: "left" | "center" | "right";
  formatter?: (cell: any) => string | HTMLElement | false;
};

export interface PrototypeTabulatorProps<T extends object> {
  columns: PrototypeTabulatorColumn<T>[];
  data: T[];
  rowIdField?: keyof T | string;
  emptyMessage?: string;
  pagination?: boolean;
  pageSize?: number;
  /** When false, hides the page-size dropdown (cleaner prototype footer). */
  pageSizeSelector?: number[] | true | false;
  initialSort?: { field: keyof T | string; dir: "asc" | "desc" };
  layout?: "fitColumns" | "fitData" | "fitDataFill" | "fitDataStretch" | "fitDataTable";
  movableColumns?: boolean;
  className?: string;
  /** Tabulator height, e.g. `"100%"` so the grid scrolls inside a flex parent. */
  tableHeight?: string | number;
  /** Bump when row HTML formatters must refresh (e.g. selection state) without data identity change. */
  formatRevision?: string | number;
  /** Highlight or style rows; runs again when `formatRevision` changes. */
  rowFormatter?: (row: T, el: HTMLElement) => void;
  headerCheckbox?: {
    checked: boolean;
    indeterminate: boolean;
    onChange: (checked: boolean) => void;
    selector?: string;
  };
  onCellClick?: (e: MouseEvent, row: T, cell: any) => void;
}

function toTabulatorColumnDefs<T extends object>(columns: PrototypeTabulatorColumn<T>[]) {
  return columns.map((col) => ({
    title: col.title,
    field: col.field as string,
    headerSort: col.headerSort !== false,
    headerFilter: col.headerFilter ?? false,
    hozAlign: col.hozAlign ?? ("center" as const),
    vertAlign: col.vertAlign ?? ("middle" as const),
    headerHozAlign: col.headerHozAlign ?? ("center" as const),
    width: col.width,
    minWidth: col.minWidth,
    cssClass: col.cssClass,
    sorter: col.sorter,
    formatter: col.formatter ? (cell: any) => col.formatter?.(cell) : undefined,
  }));
}

/**
 * Tabulator wrapper: theme via `index.css` (.data-table-wrapper), optional header checkbox, cell actions.
 * Keeps column definitions in sync via `setColumns` so HTML formatters (e.g. checkboxes) stay current.
 */
export function PrototypeTabulator<T extends object>({
  columns,
  data,
  rowIdField = "id",
  emptyMessage = "No data",
  pagination = false,
  pageSize = 10,
  pageSizeSelector = [5, 10, 20, 50],
  initialSort,
  layout = "fitColumns",
  movableColumns = false,
  className,
  tableHeight,
  formatRevision,
  rowFormatter,
  headerCheckbox,
  onCellClick,
}: PrototypeTabulatorProps<T>) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tableRef = useRef<TabulatorFull | null>(null);
  const headerCheckboxCleanupRef = useRef<(() => void) | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const dataRef = useRef(data);
  dataRef.current = data;
  const rowFormatterRef = useRef(rowFormatter);
  rowFormatterRef.current = rowFormatter;

  /** Bumps after Tabulator finishes async `_create` so effects can safely call setData/setHeight/… */
  const [tableBuiltGeneration, setTableBuiltGeneration] = useState(0);

  const isTableReady = (table: TabulatorFull | null): table is TabulatorWithInit => {
    return Boolean(table && (table as TabulatorWithInit).initialized);
  };

  const safeRedraw = () => {
    const container = containerRef.current;
    const table = tableRef.current;
    if (!container || !isTableReady(table) || !container.isConnected) return;
    try {
      // Tabulator typing can be stricter than the runtime API; cast to access redraw.
      (table as unknown as { redraw?: (force?: boolean) => void }).redraw?.(true);
    } catch {
      // Ignore transient redraw failures during mount/unmount cycles.
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const rowIdKey = String(rowIdField);
    const tabulatorRowFormatter = rowFormatterRef.current
      ? (row: { getData: () => T; getElement: () => HTMLElement }) => {
          const rf = rowFormatterRef.current;
          if (rf) rf(row.getData(), row.getElement());
        }
      : undefined;

    const options: Record<string, unknown> = {
      data: data.map((row) => ({ ...row })),
      columns: toTabulatorColumnDefs(columns),
      layout,
      responsiveLayout: false,
      resizableColumns: false,
      movableColumns,
      placeholder: emptyMessage,
      index: rowIdKey,
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

    if (initialSort) {
      options.initialSort = [{ column: String(initialSort.field), dir: initialSort.dir }];
    }

    const instance = new TabulatorFull(containerRef.current, options as never);
    tableRef.current = instance;

    let cancelled = false;
    (instance as unknown as TabulatorEventHost).on("tableBuilt", () => {
      if (!cancelled) setTableBuiltGeneration((g) => g + 1);
    });

    const observer = new ResizeObserver(() => {
      requestAnimationFrame(() => safeRedraw());
    });
    observer.observe(containerRef.current);
    resizeObserverRef.current = observer;

    if (onCellClick) {
      (instance as unknown as TabulatorEventHost).on("cellClick", (e, cell) => {
        const cellAny = cell as { getData?: () => T };
        const row = cellAny?.getData?.() as T;
        onCellClick(e as MouseEvent, row, cellAny);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount once; updates via setData/setColumns/setHeight
  }, []);

  useEffect(() => {
    const table = tableRef.current;
    if (!isTableReady(table)) return;
    table.setData(data.map((row) => ({ ...row })));
    safeRedraw();
  }, [data, tableBuiltGeneration]);

  useEffect(() => {
    const table = tableRef.current;
    if (!isTableReady(table)) return;
    // Tabulator typings sometimes omit these methods; cast to keep runtime behavior.
    (table as unknown as { setColumns?: (cols: unknown) => void }).setColumns?.(
      toTabulatorColumnDefs(columns) as never,
    );
    table.setData(dataRef.current.map((row) => ({ ...row })));
    safeRedraw();
  }, [columns, tableBuiltGeneration]);

  useEffect(() => {
    const table = tableRef.current;
    if (!isTableReady(table) || tableHeight === undefined) return;
    (table as unknown as { setHeight?: (height: unknown) => void }).setHeight?.(
      tableHeight as never,
    );
    safeRedraw();
  }, [tableHeight, tableBuiltGeneration]);

  useEffect(() => {
    if (!isTableReady(tableRef.current) || formatRevision === undefined) return;
    safeRedraw();
  }, [formatRevision, tableBuiltGeneration]);

  useEffect(() => {
    headerCheckboxCleanupRef.current?.();
    headerCheckboxCleanupRef.current = null;
    if (!isTableReady(tableRef.current) || !containerRef.current || !headerCheckbox) return;

    const selector = headerCheckbox.selector ?? "[data-proto-header-checkbox='true']";
    const el = containerRef.current.querySelector(selector) as HTMLInputElement | null;
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
