import { ArrowRight, CircleCheck, CloudUpload, Download, FileSpreadsheet, Zap } from "lucide-react";
import { memo, useCallback, useMemo, useRef } from "react";

import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { cn } from "@/lib/utils";
import type { StagedSku } from "@/types/wizard";

export type InputMode = "ai" | "csv";

interface CsvRow {
  sku: string;
  name: string;
  current: string;
  proposed: string;
  safe: boolean;
}

interface DataStagingGridProps {
  data: StagedSku[];
  isGenerating: boolean;
  inputMode: InputMode;
  onInputModeChange: (mode: InputMode) => void;
  onRemoveGridRow: (sku: string) => void;
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
}

function DataStagingGrid({
  data,
  isGenerating,
  inputMode,
  onInputModeChange,
  onRemoveGridRow,
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
}: DataStagingGridProps) {
  const csvInput = useRef<HTMLInputElement>(null);
  const csvWarnings = csvRows.filter((r) => !r.safe).length;

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
        return `<span class="rounded border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 font-mono text-[10px] text-amber-400">LOW MARGIN</span>`;
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
    if (!d.safe) {
      const el = row.getElement();
      el.style.borderLeft = "2px solid rgb(251 113 133)";
      el.style.backgroundColor = "rgba(127, 29, 29, 0.1)";
    }
  }, []);

  const aiColumns = useMemo<DataTableColumn<StagedSku>[]>(() => [
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
      minWidth: 180,
      hozAlign: "left",
      headerHozAlign: "left",
      formatter: (cell: unknown) => {
        const val = (cell as { getValue: () => string }).getValue();
        return `<span class="text-sm font-medium text-slate-200">${val}</span>`;
      },
    },
    {
      title: "Current",
      field: "current",
      width: 100,
      sorter: "number",
      hozAlign: "right",
      headerHozAlign: "right",
      formatter: (cell: unknown) => {
        const val = (cell as { getValue: () => number }).getValue();
        return `<span class="font-mono text-sm text-slate-500 line-through">$${val.toFixed(2)}</span>`;
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
        return `<span class="font-mono text-base font-bold text-white">$${val.toFixed(2)}</span>`;
      },
    },
    {
      title: "Compliance",
      field: "safe",
      width: 130,
      formatter: (cell: unknown) => {
        const row = (cell as { getData: () => StagedSku }).getData();
        if (row.safe) return `<span class="rounded border border-emerald-400/20 bg-emerald-900/40 px-2.5 py-1 font-mono text-[10px] text-emerald-400">PASS</span>`;
        return `<span class="rounded border border-rose-400/30 bg-rose-400/10 px-2.5 py-1 font-mono text-[10px] text-rose-400">ALERT (${row.margin})</span>`;
      },
    },
    {
      title: "",
      field: "sku",
      width: 50,
      headerSort: false,
      headerFilter: false,
      hozAlign: "center",
      formatter: () => `<button data-action="remove" class="rounded p-1 text-slate-500 transition-all hover:bg-rose-400/10 hover:text-rose-400"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>`,
      cellClick: (_e: MouseEvent, cell: { getData: () => StagedSku }) => {
        const target = (_e as unknown as { target: HTMLElement }).target as HTMLElement;
        if (target.closest?.("[data-action='remove']")) {
          _e.stopPropagation();
          onRemoveGridRow(cell.getData().sku);
        }
      },
    },
  ], [onRemoveGridRow]);

  const aiRowFormatter = useMemo(() => (row: { getData: () => StagedSku; getElement: () => HTMLElement }) => {
    const d = row.getData();
    if (!d.safe) {
      const el = row.getElement();
      el.style.borderLeft = "2px solid rgb(251 113 133)";
      el.style.backgroundColor = "rgba(127, 29, 29, 0.1)";
    }
  }, []);

  return (
    <div
      className={cn(
        "relative flex h-full min-w-0 flex-1 animate-[fadeIn_0.5s_ease-out] flex-col overflow-y-auto overflow-x-hidden",
        hideModeToggle
          ? "bg-transparent"
          : "rounded-2xl border border-ithina-border bg-ithina-panel shadow-xl",
      )}
    >
      {!hideModeToggle && (
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-ithina-border bg-white/[0.01] px-6 py-4">
        {!hideModeToggle ? (
          <div className="flex items-center gap-1 rounded-xl border border-ithina-border bg-ithina-bg p-1">
            <button
              onClick={() => onInputModeChange("ai")}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-all",
                inputMode === "ai" ? "bg-ithina-purple text-white shadow-sm" : "text-slate-400 hover:text-white",
              )}
            >
              <Zap className="size-3.5" />
              AI Assisted
            </button>
            <button
              onClick={() => onInputModeChange("csv")}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-all",
                inputMode === "csv" ? "bg-ithina-purple text-white shadow-sm" : "text-slate-400 hover:text-white",
              )}
            >
              <FileSpreadsheet className="size-3.5" />
              CSV Upload
            </button>
          </div>
        ) : (
          <div />
        )}
        <div className="ml-auto flex items-center gap-3">
          {inputMode === "ai" && data.length > 0 && (
            <span className="hidden text-xs text-slate-400 lg:block">
              {data.length} SKUs staged — Review proposals below
            </span>
          )}
          {inputMode === "csv" && csvRows.length > 0 && (
            <span className="hidden text-xs text-slate-400 lg:block">
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
                <div className="overflow-hidden rounded-xl border border-ithina-border bg-ithina-panel">
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="sticky top-0 z-[1] border-b border-ithina-border bg-ithina-sidebar font-mono text-[10px] uppercase tracking-widest text-slate-500">
                        <tr>
                          <th className="px-5 py-2.5">SKU</th>
                          <th className="px-4 py-2.5">Name</th>
                          <th className="px-4 py-2.5 text-right">Current</th>
                          <th className="px-4 py-2.5 text-right">Proposed</th>
                          <th className="px-4 py-2.5 text-center">Safe</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ithina-border/50">
                        {csvRows.slice(0, 8).map((row, i) => (
                          <tr
                            key={`${row.sku}-${i}`}
                            className={cn("hover:bg-white/[0.02]", !row.safe && "opacity-60")}
                          >
                            <td className="px-5 py-2 font-mono text-xs text-slate-400">{row.sku}</td>
                            <td className="px-4 py-2 text-slate-200">{row.name}</td>
                            <td className="px-4 py-2 text-right font-mono text-xs text-slate-500 line-through">
                              ${row.current}
                            </td>
                            <td
                              className={cn(
                                "px-4 py-2 text-right font-mono text-xs font-bold",
                                row.safe ? "text-emerald-400" : "text-rose-400",
                              )}
                            >
                              ${row.proposed}
                            </td>
                            <td
                              className={cn(
                                "px-4 py-2 text-center text-xs",
                                row.safe ? "text-emerald-400" : "text-rose-400",
                              )}
                            >
                              {row.safe ? "✓" : "!"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {csvRows.length > 8 && (
                    <div className="border-t border-ithina-border px-5 py-2 font-mono text-[10px] text-slate-600">
                      +{csvRows.length - 8} more rows
                    </div>
                  )}
                </div>
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
              />
            </div>
          )}
        </div>
      )}

      {inputMode === "ai" && (
        <div className={cn("flex flex-1 flex-col overflow-auto", isGenerating && "pointer-events-none opacity-50 transition-opacity")}>
          {data.length === 0 && (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 p-10 text-center">
              <div className="flex size-12 items-center justify-center rounded-full border border-ithina-purple/20 bg-ithina-purple/10">
                <Zap className="size-6 text-ithina-purple" />
              </div>
              <p className="text-sm text-slate-400">Describe your promotion in the chat — the AI will fetch and stage SKUs here.</p>
            </div>
          )}
          {data.length > 0 && (
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
            />
          )}
        </div>
      )}
    </div>
  );
}

export default memo(DataStagingGrid);
