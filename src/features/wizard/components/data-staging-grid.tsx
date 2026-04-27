import { ArrowRight, CircleCheck, CloudUpload, Download, FileSpreadsheet, Zap } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef } from "react";

import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { IthBadge, IthTable, type IthColumnDef } from "@/components/ui/ith-table";
import { cn } from "@/lib/utils";
import type { StagedSku } from "@/types/wizard";

function escapeCellText(raw: string): string {
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Any SKU with `safe === false` (API `is_safe: false`) — margin, guard rails, etc. */
function stagingRowHasAlert(row: { safe: boolean }): boolean {
  return row.safe === false;
}

/** Short label for compliance pill when row is in alert state. */
function alertComplianceDetail(row: StagedSku): string {
  const reason = row.violationReason?.trim();
  if (reason) {
    return reason.length > 22 ? `${reason.slice(0, 22)}…` : reason;
  }
  return row.margin ?? "—";
}

/** BOGO / buy-X-get-Y style rows (used to show free vs primary when API sets is_free). */
function isBogoLikeOffer(row: StagedSku): boolean {
  const t = (row.offerType ?? "").toLowerCase().trim();
  const l = (row.offerLabel ?? "").toLowerCase().trim();
  if (/\bbogo(f)?\b/.test(t)) return true;
  if (t.includes("buy") && t.includes("get")) return true;
  if (
    l.includes("buy 1 get 1") ||
    l.includes("buy one get one") ||
    l.includes("bogof") ||
    l.includes("bogo")
  ) {
    return true;
  }
  return false;
}

export type InputMode = "ai" | "csv";

/* ─── CSV preview table ──────────────────────────────────────────────────── */

interface CsvRow {
  sku: string;
  name: string;
  current: string;
  proposed: string;
  safe: boolean;
}

const CSV_PREVIEW_COLS: IthColumnDef<CsvRow>[] = [
  {
    key: "sku",
    label: "SKU",
    width: "w-[100px]",
    render: (row) => <span className="font-mono text-xs text-slate-400">{row.sku}</span>,
  },
  {
    key: "name",
    label: "Name",
    render: (row) => <span className="text-sm text-slate-200">{row.name}</span>,
  },
  {
    key: "current",
    label: "Current",
    align: "right",
    render: (row) => <span className="font-mono text-xs text-slate-500 line-through">${row.current}</span>,
  },
  {
    key: "proposed",
    label: "Proposed",
    align: "right",
    render: (row) => (
      <span className={`font-mono text-xs font-bold ${row.safe ? "text-emerald-400" : "text-rose-400"}`}>
        ${row.proposed}
      </span>
    ),
  },
  {
    key: "safe",
    label: "Check",
    align: "center",
    render: (row) => (
      <IthBadge label={row.safe ? "Pass" : "Alert"} variant={row.safe ? "emerald" : "rose"} />
    ),
  },
];

function CsvPreviewTable({ rows }: { rows: CsvRow[] }) {
  const preview = useMemo(
    () => rows.slice(0, 8).map((r, i) => ({ ...r, __key: `${r.sku}-${i}` })),
    [rows],
  );

  return (
    <div className="overflow-hidden rounded-xl">
      <IthTable<CsvRow & { __key: string }>
        data={preview}
        columns={CSV_PREVIEW_COLS as IthColumnDef<CsvRow & { __key: string }>[]}
        rowKey={(r) => r.__key}
        rowClassName={(row) => (!row.safe ? "opacity-60" : "")}
        className="max-h-64 overflow-y-auto rounded-xl"
      />
      {rows.length > 8 && (
        <div className="border-t border-ithina-border bg-ithina-panel px-5 py-2 font-mono text-[10px] text-slate-600">
          +{rows.length - 8} more rows
        </div>
      )}
    </div>
  );
}

interface DataStagingGridProps {
  data: StagedSku[];
  isGenerating: boolean;
  inputMode: InputMode;
  onInputModeChange: (mode: InputMode) => void;
  /** AI grid: include/exclude SKU without removing the row from the table. */
  onToggleGridRowIncluded: (sku: string) => void;
  /** AI grid: set include on all rows (header “select all”). */
  onSetAllGridRowsIncluded?: (included: boolean) => void;
  /** AI grid: update the discount % for a specific SKU. */
  onDiscountChange: (sku: string, discount: number) => void;
  csvRows: CsvRow[];
  csvFileName: string;
  onCsvParsed: (rows: CsvRow[], fileName: string) => void;
  onCsvClear: () => void;
  onCsvConfirm: () => void;
  /** When set (standalone CSV wizard), bottom CTA confirms and advances — matches index_3.1.html */
  onCsvConfirmAndProceed?: () => void;
  onRemoveCsvRow: (idx: number) => void;
  onRemoveAllViolations: () => void;
  marginFloor: number;
  hideModeToggle?: boolean;
  /** Step 1 AI grid: campaign name + schedule on the left; toggles on the right. */
  aiCampaignToolbar?: {
    campaignName: string;
    onCampaignNameChange: (value: string) => void;
    scheduleStartLocal: string;
    scheduleEndLocal: string;
    onScheduleStartLocalChange: (value: string) => void;
    onScheduleEndLocalChange: (value: string) => void;
  };
}

function DataStagingGrid({
  data,
  isGenerating,
  inputMode,
  onInputModeChange,
  onToggleGridRowIncluded,
  onSetAllGridRowsIncluded,
  onDiscountChange,
  csvRows,
  csvFileName,
  onCsvParsed,
  onCsvClear,
  onCsvConfirm,
  onCsvConfirmAndProceed,
  onRemoveCsvRow,
  onRemoveAllViolations,
  marginFloor,
  hideModeToggle = false,
  aiCampaignToolbar,
}: DataStagingGridProps) {
  const csvInput = useRef<HTMLInputElement>(null);
  /** Latest grid rows for formatters — avoids recreating Tabulator columns on every `included` toggle. */
  const gridDataRef = useRef(data);
  gridDataRef.current = data;

  const csvWarnings = csvRows.filter((r) => !r.safe).length;

  const aiIncludedCount = useMemo(() => data.filter((r) => r.included !== false).length, [data]);

  const parseCsvText = useCallback(
    (text: string, filename: string) => {
      const lines = text.trim().split(/\r?\n/);
      const rows = lines
        .slice(1)
        .filter((l) => l.trim())
        .map((line, i) => {
          const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
          const sku = cols[0] || `SKU-${i + 1}`;
          const name = cols[1] || `Product ${i + 1}`;
          const current = parseFloat(cols[2]) || 10.0;
          const proposed = parseFloat(cols[3]) || 8.0;
          const margin = current > 0 ? (current - proposed) / current : 0;
          return { sku, name, current: current.toFixed(2), proposed: proposed.toFixed(2), safe: margin >= marginFloor };
        });
      onCsvParsed(rows, filename);
    },
    [marginFloor, onCsvParsed],
  );

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => parseCsvText(ev.target?.result as string, file.name);
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const csv = "SKU,Name,Current Price,Proposed Price\nSKU-001,Product Name,12.99,10.39\nSKU-002,Another Product,8.99,7.49";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ithina_sku_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const csvColumnsWithIndex = useMemo(() => {
    const indexed = csvRows.map((r, i) => ({ ...r, __idx: i, __id: String(i) }));
    return indexed;
  }, [csvRows]);

  type IndexedCsvRow = (typeof csvColumnsWithIndex)[number];

  const csvTableColumns = useMemo<DataTableColumn<IndexedCsvRow>[]>(() => [
    {
      title: "SKU",
      field: "sku",
      width: 110,
      formatter: (cell: unknown) => {
        const val = (cell as { getValue: () => string }).getValue();
        return `<span class="font-mono text-xs text-slate-400">${val}</span>`;
      },
    },
    {
      title: "Product Name",
      field: "name",
      minWidth: 180,
      widthGrow: 1,
      hozAlign: "left",
      headerHozAlign: "left",
      formatter: (cell: unknown) => {
        const val = (cell as { getValue: () => string }).getValue();
        return `<span class="text-sm font-medium text-slate-200">${val}</span>`;
      },
    },
    {
      title: "Current Price",
      field: "current",
      width: 110,
      hozAlign: "right",
      headerHozAlign: "right",
      formatter: (cell: unknown) => {
        const val = (cell as { getValue: () => string }).getValue();
        return `<span class="font-mono text-sm text-slate-500 line-through">$${val}</span>`;
      },
    },
    {
      title: "Proposed Price",
      field: "proposed",
      width: 120,
      hozAlign: "right",
      headerHozAlign: "right",
      formatter: (cell: unknown) => {
        const val = (cell as { getValue: () => string }).getValue();
        return `<span class="font-mono text-sm font-bold text-white">$${val}</span>`;
      },
    },
    {
      title: "Margin Check",
      field: "safe",
      width: 120,
      formatter: (cell: unknown) => {
        const val = (cell as { getValue: () => boolean }).getValue();
        if (val) return `<span class="rounded border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 font-mono text-[10px] text-emerald-400">PASS</span>`;
        return `<span class="rounded border border-rose-400/30 bg-rose-400/10 px-2 py-0.5 font-mono text-[10px] text-rose-400">ALERT</span>`;
      },
    },
    {
      title: "",
      field: "__idx",
      width: 50,
      headerSort: false,
      headerFilter: false,
      hozAlign: "center",
      formatter: () => `<button data-action="remove" class="rounded p-1 text-slate-500 transition-all hover:bg-rose-400/10 hover:text-rose-400"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>`,
      cellClick: (_e: MouseEvent, cell: { getData: () => IndexedCsvRow }) => {
        const target = (_e as unknown as { target: HTMLElement }).target as HTMLElement;
        if (target.closest?.("[data-action='remove']")) {
          _e.stopPropagation();
          onRemoveCsvRow(cell.getData().__idx);
        }
      },
    },
  ], [onRemoveCsvRow]);

  const csvRowFormatter = useMemo(() => (row: { getData: () => IndexedCsvRow; getElement: () => HTMLElement }) => {
    const d = row.getData();
    row.getElement().classList.toggle("wizard-staging-row-alert", stagingRowHasAlert(d));
  }, []);

  const aiColumns = useMemo<DataTableColumn<StagedSku>[]>(() => {
    const includeColumn: DataTableColumn<StagedSku> = {
      title: "",
      field: "included",
      width: 40,
      cssClass: "wizard-staging-col-include",
      headerSort: false,
      headerFilter: false,
      hozAlign: "center",
      headerHozAlign: "center",
      formatter: (cell: unknown) => {
        const row = (cell as { getData: () => StagedSku }).getData();
        const checked = row.included !== false;
        return `<input type="checkbox" data-action="toggle-include" aria-label="Include in campaign" ${checked ? "checked" : ""} />`;
      },
      cellClick: (_e: MouseEvent, cell: { getData: () => StagedSku }) => {
        const target = (_e as unknown as { target: HTMLElement }).target as HTMLElement;
        const input = target.closest?.("[data-action='toggle-include']") as HTMLInputElement | null;
        if (input) {
          _e.preventDefault();
          _e.stopPropagation();
          const row = cell.getData();
          const wasIncluded = row.included !== false;
          input.checked = !wasIncluded;
          onToggleGridRowIncluded(row.sku);
        }
      },
    };

    if (onSetAllGridRowsIncluded) {
      includeColumn.titleFormatter = function formatIncludeColumnHeader() {
        return `<input type="checkbox" data-action="toggle-all-include" aria-label="Include all SKUs in campaign" />`;
      };
    }

    return [
      includeColumn,
    {
      title: "SKU",
      field: "sku",
      width: 110,
      formatter: (cell: unknown) => {
        const val = (cell as { getValue: () => string }).getValue();
        return `<span class="font-mono text-xs text-slate-400">${val}</span>`;
      },
    },
    {
      title: "Product",
      field: "name",
      minWidth: 200,
      widthGrow: 1.35,
      hozAlign: "left",
      headerHozAlign: "left",
      vertAlign: "top",
      variableHeight: true,
      formatter: (cell: unknown) => {
        const row = (cell as { getData: () => StagedSku }).getData();
        const val = escapeCellText(row.name ?? "");
        const gridRows = gridDataRef.current;
        const includedRows = gridRows.filter((r) => r.included !== false);
        const freeInGrid = includedRows.filter((r) => r.isFree);
        const bogo = isBogoLikeOffer(row);
        const freeBadge = row.isFree
          ? `<span class="shrink-0 rounded border border-ithina-purple/40 bg-ithina-purple/15 px-1 py-px font-mono text-[8px] font-bold uppercase leading-none text-ithina-purple">Free</span>`
          : "";
        const primaryBadge =
          bogo && freeInGrid.length > 0 && !row.isFree
            ? `<span class="shrink-0 rounded border border-slate-500/45 bg-slate-500/10 px-1 py-px font-mono text-[8px] font-bold uppercase leading-none text-slate-400">Primary</span>`
            : "";
        return `<div class="flex flex-wrap items-start gap-x-1.5 gap-y-1 text-xs font-medium leading-snug text-slate-200"><span class="min-w-0 max-w-full flex-1 break-words">${val}</span>${freeBadge}${primaryBadge}</div>`;
      },
    },
    {
      title: "Offer",
      field: "offerLabel",
      width: 132,
      minWidth: 118,
      maxWidth: 220,
      hozAlign: "left",
      headerHozAlign: "left",
      vertAlign: "top",
      variableHeight: true,
      formatter: (cell: unknown) => {
        const row = (cell as { getData: () => StagedSku }).getData();
        const label = (row.offerLabel ?? "").trim();
        const typeRaw = (row.offerType ?? "").trim();
        const labelEsc = label ? escapeCellText(label) : "";
        const typeEsc = typeRaw ? escapeCellText(typeRaw) : "";

        const gridRowsOffer = gridDataRef.current;
        const includedRows = gridRowsOffer.filter((r) => r.included !== false);
        const freeRows = includedRows.filter((r) => r.isFree);
        const bogo = isBogoLikeOffer(row);

        let mainHtml = "";
        if (!labelEsc && !typeEsc) {
          mainHtml = `<span class="text-[11px] text-slate-600">—</span>`;
        } else if (typeEsc && labelEsc) {
          mainHtml = `<span class="text-[11px] leading-snug text-slate-200"><span class="font-mono text-[10px] text-slate-500">${typeEsc}</span><span class="mx-1 text-slate-600">·</span><span>${labelEsc}</span></span>`;
        } else {
          mainHtml = `<span class="text-[11px] leading-snug text-slate-200">${typeEsc || labelEsc}</span>`;
        }

        let roleHtml = "";
        if (bogo && freeRows.length > 0) {
          if (row.isFree) {
            const primaries = includedRows.filter((r) => !r.isFree);
            const names = primaries
              .map((p) => p.name)
              .slice(0, 3)
              .join(", ");
            const more = primaries.length > 3 ? "…" : "";
            roleHtml = `<span class="mt-1 block text-[10px] font-medium text-ithina-purple/90">Free unit</span>`;
            if (names) {
              roleHtml += `<span class="mt-0.5 block text-[10px] leading-snug text-slate-500">Paid with: ${escapeCellText(names)}${more}</span>`;
            }
          } else {
            roleHtml = `<span class="mt-1 block text-[10px] text-slate-500">Primary (paid line)</span>`;
            if (freeRows.length === 1) {
              roleHtml += `<span class="mt-0.5 block text-[10px] leading-snug text-slate-400">+ Free: ${escapeCellText(freeRows[0].name)}</span>`;
            } else if (freeRows.length > 1) {
              roleHtml += `<span class="mt-0.5 block text-[10px] text-slate-400">+ ${freeRows.length} free units</span>`;
            }
          }
        }

        if (roleHtml) {
          return `<div class="flex flex-col gap-0">${mainHtml}${roleHtml}</div>`;
        }
        return mainHtml;
      },
    },
    {
      title: "Current",
      field: "current",
      width: 100,
      minWidth: 92,
      sorter: "number",
      hozAlign: "right",
      headerHozAlign: "right",
      formatter: (cell: unknown) => {
        const val = (cell as { getValue: () => number }).getValue();
        return `<span class="font-mono text-xs text-slate-500 line-through">$${val.toFixed(2)}</span>`;
      },
    },
    {
      title: "Discount",
      field: "discount",
      width: 110,
      sorter: "number",
      hozAlign: "center",
      headerHozAlign: "center",
      formatter: (cell: unknown) => {
        const row = (cell as { getData: () => StagedSku }).getData();
        const val = row.discount ?? 0;
        return `<div class="flex items-center justify-center gap-1"><input type="number" data-action="discount-input" min="0" max="100" step="1" value="${val}" class="w-12 rounded border border-slate-600 bg-slate-800 px-1 py-0.5 text-center font-mono text-[11px] leading-tight text-white outline-none focus:border-ithina-purple focus:ring-1 focus:ring-ithina-purple [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" /><span class="font-mono text-[10px] text-slate-400">%</span></div>`;
      },
      cellClick: (_e: MouseEvent) => {
        const target = (_e as unknown as { target: HTMLElement }).target as HTMLElement;
        if (target.tagName === "INPUT") {
          _e.stopPropagation();
        }
      },
    },
    {
      title: "Stock",
      field: "stockQty",
      width: 88,
      minWidth: 80,
      sorter: "number",
      hozAlign: "right",
      headerHozAlign: "right",
      formatter: (cell: unknown) => {
        const row = (cell as { getData: () => StagedSku }).getData();
        const q = row.stockQty;
        if (typeof q !== "number" || Number.isNaN(q)) {
          return `<span class="font-mono text-[11px] text-slate-600">—</span>`;
        }
        return `<span class="font-mono text-xs text-slate-300">${q}</span>`;
      },
    },
    {
      title: "Proposed",
      field: "proposed",
      width: 110,
      sorter: "number",
      hozAlign: "right",
      headerHozAlign: "right",
      formatter: (cell: unknown) => {
        const val = (cell as { getValue: () => number }).getValue();
        return `<span class="font-mono text-sm font-bold leading-tight text-white">$${val.toFixed(2)}</span>`;
      },
    },
    {
      title: "Compliance",
      field: "safe",
      width: 130,
      formatter: (cell: unknown) => {
        const row = (cell as { getData: () => StagedSku }).getData();
        if (row.safe) return `<span class="rounded border border-emerald-400/20 bg-emerald-900/40 px-1.5 py-0.5 font-mono text-[9px] leading-none text-emerald-400">PASS</span>`;
        const detail = escapeCellText(alertComplianceDetail(row));
        const fullReason = row.violationReason?.trim()
          ? escapeCellText(row.violationReason.trim())
          : "";
        const titleAttr = fullReason ? ` title="${fullReason}"` : "";
        return `<span class="inline-flex max-w-full flex-col gap-0.5 rounded border border-rose-400/35 bg-rose-400/12 px-1.5 py-0.5 font-mono text-[9px] leading-tight text-rose-300"${titleAttr}><span class="font-semibold tracking-wide text-rose-400">ALERT</span><span class="truncate text-[8px] text-rose-200/90">${detail}</span></span>`;
      },
    },
    {
      title: "Suggest dates",
      field: "agentSuggestSchedule",
      minWidth: 118,
      widthGrow: 0.65,
      sorter: "string",
      hozAlign: "left",
      headerHozAlign: "left",
      formatter: (cell: unknown) => {
        const row = (cell as { getData: () => StagedSku }).getData();
        const raw = (row.agentSuggestSchedule ?? "").trim() || "—";
        const esc = escapeCellText(raw);
        return `<span class="text-[11px] leading-snug text-slate-300">${esc}</span>`;
      },
    },
    ];
  }, [onToggleGridRowIncluded, onDiscountChange, onSetAllGridRowsIncluded]);

  const aiRowFormatter = useMemo(() => (row: { getData: () => StagedSku; getElement: () => HTMLElement }) => {
    const d = row.getData();
    const el = row.getElement();
    el.classList.toggle("wizard-staging-row-excluded", d.included === false);
    el.classList.toggle("wizard-staging-row-free", d.isFree === true);
    const alert = stagingRowHasAlert(d);
    el.classList.toggle("wizard-staging-row-alert", alert);
    if (alert) {
      el.style.borderLeft = "";
      el.style.backgroundColor = "";
    } else if (d.isFree) {
      el.style.borderLeft = "3px solid var(--color-ithina-purple)";
      el.style.backgroundColor = "color-mix(in srgb, var(--color-ithina-purple) 12%, transparent)";
    } else {
      el.style.borderLeft = "";
      el.style.backgroundColor = "";
    }
  }, []);

  const aiTableRef = useRef<HTMLDivElement>(null);
  const setAllIncludedRef = useRef(onSetAllGridRowsIncluded);
  setAllIncludedRef.current = onSetAllGridRowsIncluded;

  const discountChangeRef = useRef(onDiscountChange);
  discountChangeRef.current = onDiscountChange;

  useEffect(() => {
    const container = aiTableRef.current;
    if (!container) return;

    const commitDiscount = (input: HTMLInputElement) => {
      const row = input.closest(".tabulator-row");
      if (!row) return;
      const skuCell = row.querySelector(".tabulator-cell[tabulator-field='sku']");
      const sku = skuCell?.textContent?.trim() ?? "";
      if (!sku) return;
      const val = Math.max(0, Math.min(100, Math.round(Number(input.value) || 0)));
      input.value = String(val);
      discountChangeRef.current(sku, val);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" && (target as HTMLInputElement).dataset.action === "discount-input") {
        if (e.key === "Enter") {
          e.preventDefault();
          commitDiscount(target as HTMLInputElement);
          (target as HTMLInputElement).blur();
        }
      }
    };

    const handleBlur = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" && (target as HTMLInputElement).dataset.action === "discount-input") {
        commitDiscount(target as HTMLInputElement);
      }
    };

    container.addEventListener("keydown", handleKeyDown, true);
    container.addEventListener("focusout", handleBlur, true);
    return () => {
      container.removeEventListener("keydown", handleKeyDown, true);
      container.removeEventListener("focusout", handleBlur, true);
    };
  }, []);

  useEffect(() => {
    const root = aiTableRef.current;
    if (!root || !onSetAllGridRowsIncluded) return;

    const syncHeaderIncludeAll = () => {
      const input = root.querySelector<HTMLInputElement>('[data-action="toggle-all-include"]');
      if (!input) return;
      const rows = gridDataRef.current;
      const all = rows.length > 0 && rows.every((r) => r.included !== false);
      const some = rows.some((r) => r.included !== false);
      const partial = some && !all;
      input.checked = all;
      input.indeterminate = partial;
      input.setAttribute(
        "aria-label",
        all ? "Clear all SKUs from campaign" : "Include all SKUs in campaign",
      );
    };

    syncHeaderIncludeAll();
    const outer = requestAnimationFrame(() => {
      syncHeaderIncludeAll();
      requestAnimationFrame(syncHeaderIncludeAll);
    });

    const handler = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest?.('[data-action="toggle-all-include"]')) return;
      e.preventDefault();
      e.stopPropagation();
      const rows = gridDataRef.current;
      const all = rows.length > 0 && rows.every((r) => r.included !== false);
      setAllIncludedRef.current?.(!all);
    };
    root.addEventListener("click", handler, true);

    return () => {
      cancelAnimationFrame(outer);
      root.removeEventListener("click", handler, true);
    };
  }, [data, onSetAllGridRowsIncluded]);

  return (
    <div
      className={cn(
        "relative flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overflow-x-auto",
        hideModeToggle
          ? "bg-transparent"
          : "rounded-2xl border border-ithina-border bg-ithina-panel shadow-xl",
      )}
    >
      {!hideModeToggle && (
      <header className="flex shrink-0 flex-wrap items-start justify-between gap-3 border-b border-ithina-border bg-white/[0.01] px-4 py-2.5">
        <div className="min-w-0 flex-1 space-y-2 pr-2">
          {inputMode === "ai" && data.length > 0 && aiCampaignToolbar ? (
            <>
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <span className="shrink-0 text-xs font-medium text-slate-400">Campaign Name:</span>
                <input
                  id="wizard-ai-campaign-name"
                  type="text"
                  value={aiCampaignToolbar.campaignName}
                  onChange={(e) => aiCampaignToolbar.onCampaignNameChange(e.target.value)}
                  placeholder="e.g. Q3 Sushi Promo"
                  autoComplete="off"
                  className="min-h-8 min-w-[12rem] max-w-xl flex-1 rounded-lg border border-ithina-border bg-ithina-bg px-3 py-1.5 text-xs font-semibold text-white shadow-inner transition-colors focus:border-ithina-purple focus:outline-none"
                />
              </div>
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <span className="shrink-0 text-xs font-medium text-slate-400">Campaign schedule:</span>
                <input
                  id="wizard-ai-schedule-start"
                  type="datetime-local"
                  value={aiCampaignToolbar.scheduleStartLocal}
                  onChange={(e) => aiCampaignToolbar.onScheduleStartLocalChange(e.target.value)}
                  aria-label="Campaign start"
                  className="wizard-campaign-datetime min-h-8 min-w-0 rounded-lg border border-ithina-border bg-ithina-bg py-1.5 pl-2 pr-9 text-[11px] text-white transition-colors focus:border-ithina-purple focus:outline-none sm:w-[11rem]"
                />
                <span className="shrink-0 text-xs font-medium text-slate-500">to</span>
                <input
                  id="wizard-ai-schedule-end"
                  type="datetime-local"
                  value={aiCampaignToolbar.scheduleEndLocal}
                  onChange={(e) => aiCampaignToolbar.onScheduleEndLocalChange(e.target.value)}
                  aria-label="Campaign end"
                  className="wizard-campaign-datetime min-h-8 min-w-0 rounded-lg border border-ithina-border bg-ithina-bg py-1.5 pl-2 pr-9 text-[11px] text-white transition-colors focus:border-ithina-purple focus:outline-none sm:w-[11rem]"
                />
              </div>
            </>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <div className="flex items-center gap-0.5 rounded-lg border border-ithina-border bg-ithina-bg p-0.5">
            <button
              type="button"
              onClick={() => onInputModeChange("ai")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                inputMode === "ai" ? "bg-ithina-purple text-white shadow-sm" : "text-slate-400 hover:text-white",
              )}
            >
              <Zap className="size-3.5" />
              AI Assisted
            </button>
            <button
              type="button"
              onClick={() => onInputModeChange("csv")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                inputMode === "csv" ? "bg-ithina-purple text-white shadow-sm" : "text-slate-400 hover:text-white",
              )}
            >
              <FileSpreadsheet className="size-3.5" />
              CSV Upload
            </button>
          </div>
          {inputMode === "ai" && data.length > 0 && (
            <span className="max-w-[14rem] text-right text-[11px] leading-snug text-slate-400 sm:max-w-none sm:text-xs">
              {aiIncludedCount} of {data.length} SKUs included — Review proposals below
            </span>
          )}
          {inputMode === "csv" && csvRows.length > 0 && (
            <span className="text-right text-xs text-slate-400">
              {csvRows.length} rows loaded
            </span>
          )}
        </div>
      </header>
      )}

      {inputMode === "csv" && (
        <div className={cn("flex flex-1 flex-col overflow-hidden", hideModeToggle && "overflow-y-auto p-8")}>
          {csvRows.length === 0 ? (
            <div className={cn("flex flex-1 flex-col items-center justify-center gap-6 p-10", hideModeToggle && "max-w-2xl mx-auto w-full p-0 gap-6")}>
              <div className="text-center">
                <h3 className={cn("text-[34px] font-semibold text-white", hideModeToggle && "text-xl font-bold mb-1")}>Upload SKU Data</h3>
                <p className="mt-1 text-sm text-slate-400">Upload a CSV with SKUs, names and prices.</p>
              </div>
              <div
                onClick={() => csvInput.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                className={cn(
                  "group flex w-full max-w-lg cursor-pointer flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-ithina-border p-10 transition-all hover:border-ithina-purple/50 hover:bg-ithina-purple/5",
                  hideModeToggle && "max-w-none p-12",
                )}
              >
                <div className="flex size-14 items-center justify-center rounded-full border border-ithina-purple/20 bg-ithina-purple/10 transition-transform group-hover:scale-110">
                  <CloudUpload className="size-7 text-ithina-purple" />
                </div>
                <div className="text-center">
                  <p className="mb-1 text-sm font-semibold text-white">Drop CSV or click to browse</p>
                  <p className="text-xs text-slate-500 font-mono">SKU, Name, Current Price, Proposed Price</p>
                </div>
              </div>
              <input ref={csvInput} type="file" accept=".csv,.tsv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              <button
                type="button"
                onClick={downloadTemplate}
                className="flex items-center gap-2 text-xs text-slate-400 transition-colors hover:text-ithina-purple"
              >
                {hideModeToggle ? <Download className="size-3.5" /> : <CloudUpload className="size-3.5" />}
                {hideModeToggle ? "Download template" : "Download CSV Template"}
              </button>
            </div>
          ) : hideModeToggle ? (
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
              <div className="text-center">
                <h3 className="mb-1 text-xl font-bold text-white">Upload SKU Data</h3>
                <p className="text-sm text-slate-400">Upload a CSV with SKUs, names and prices.</p>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 rounded-xl border border-ithina-border bg-ithina-panel px-4 py-3">
                  <CircleCheck className="size-4 shrink-0 text-emerald-400" aria-hidden />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-white">{csvFileName}</span>
                  <span className="shrink-0 rounded bg-ithina-purple/10 px-2 py-0.5 font-mono text-[10px] text-ithina-purple">
                    {csvRows.length} rows
                  </span>
                  {csvWarnings > 0 && (
                    <span className="shrink-0 rounded bg-rose-400/10 px-2 py-0.5 font-mono text-[10px] text-rose-400">
                      {csvWarnings} warnings
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={onCsvClear}
                    className="ml-2 shrink-0 text-xs text-slate-500 transition-colors hover:text-white"
                  >
                    Clear
                  </button>
                </div>
                <CsvPreviewTable rows={csvRows} />
                <button
                  type="button"
                  onClick={() => (onCsvConfirmAndProceed ?? onCsvConfirm)()}
                  className="flex items-center gap-2 self-center rounded-xl bg-ithina-purple px-7 py-3 text-sm font-bold text-white transition-all hover:bg-ithina-purple-hover"
                >
                  Confirm &amp; Select Screens
                  <ArrowRight className="size-4" aria-hidden />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="flex shrink-0 items-center justify-between border-b border-ithina-border bg-ithina-bg/30 px-6 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-white">{csvFileName}</span>
                  <span className="rounded border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 font-mono text-[10px] text-emerald-400">{csvRows.length} rows</span>
                  {csvWarnings > 0 && (
                    <span className="rounded border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 font-mono text-[10px] text-amber-400">{csvWarnings} warnings</span>
                  )}
                </div>
                <div className="flex gap-2">
                  {csvWarnings > 0 && (
                    <button onClick={onRemoveAllViolations} className="flex items-center gap-1.5 rounded-lg border border-amber-400/20 px-3 py-1.5 text-xs text-amber-400 transition-colors hover:bg-amber-400/10 hover:text-white">
                      Remove {csvWarnings} violations
                    </button>
                  )}
                  <button onClick={onCsvClear} className="rounded-lg border border-ithina-border px-3 py-1.5 text-xs text-slate-400 transition-colors hover:text-white">Replace File</button>
                  <button onClick={onCsvConfirm} className="rounded-lg bg-ithina-purple px-4 py-1.5 text-xs font-bold text-white transition-colors hover:bg-ithina-purple-hover">Confirm &amp; Stage</button>
                </div>
              </div>
              <DataTable<IndexedCsvRow>
                columns={csvTableColumns}
                data={csvColumnsWithIndex}
                rowIdField="__id"
                emptyMessage="No CSV rows"
                pagination={false}
                headerFilters={false}
                showRowNumber
                layout="fitColumns"
                rowFormatter={csvRowFormatter}
                className="wizard-staging-table min-h-0"
              />
            </div>
          )}
        </div>
      )}

      {inputMode === "ai" && (
        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col overflow-hidden",
            isGenerating && "pointer-events-none opacity-50 transition-opacity",
          )}
        >
          {data.length === 0 && (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 p-10 text-center">
              <div className="flex size-12 items-center justify-center rounded-full border border-ithina-purple/20 bg-ithina-purple/10">
                <Zap className="size-6 text-ithina-purple" />
              </div>
              <p className="text-sm text-slate-400">Describe your promotion in the chat — the AI will fetch and stage SKUs here.</p>
            </div>
          )}
          {data.length > 0 && (
            <div ref={aiTableRef} className="flex min-h-0 flex-1 flex-col overflow-auto px-2 pb-2 pt-0 sm:px-3">
              <DataTable<StagedSku>
                columns={aiColumns}
                data={data}
                rowIdField="sku"
                emptyMessage="No SKUs staged"
                pagination={false}
                headerFilters={false}
                showRowNumber
                layout="fitColumns"
                rowFormatter={aiRowFormatter}
                className="wizard-staging-table min-h-0 flex-1"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default memo(DataStagingGrid);
