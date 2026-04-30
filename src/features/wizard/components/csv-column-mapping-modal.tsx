import {
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  Pencil,
  RefreshCw,
  Trash2,
  Upload,
  Wand2,
} from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/** Backend / process_csv_mapping keys */
export const CSV_SYSTEM_FIELD_KEYS = [
  "sku",
  "product_name",
  "current_price",
  "proposed_price",
  "stock_qty",
] as const;

export type CsvSystemFieldKey = (typeof CSV_SYSTEM_FIELD_KEYS)[number];

const FIELD_LABELS: Record<CsvSystemFieldKey, { label: string; required: boolean }> = {
  sku: { label: "SKU / Item Code", required: true },
  product_name: { label: "Product Name", required: false },
  current_price: { label: "Current / Retail Price", required: true },
  proposed_price: { label: "Sale / Promo Price", required: false },
  stock_qty: { label: "Stock Quantity", required: false },
};

/** Map system field → CSV header; clears other fields that pointed at `csvHeader`, then assigns. */
export function assignCsvColumnToField(
  prev: Record<string, string>,
  csvHeader: string,
  field: CsvSystemFieldKey | "",
): Record<string, string> {
  const next: Record<string, string> = { ...prev };
  for (const k of CSV_SYSTEM_FIELD_KEYS) {
    if (next[k] === csvHeader) next[k] = "";
  }
  if (field) {
    next[field] = csvHeader;
  }
  return next;
}

function fieldRoleForColumn(mapping: Record<string, string>, csvHeader: string): CsvSystemFieldKey | "" {
  const hit = CSV_SYSTEM_FIELD_KEYS.find((k) => (mapping[k] ?? "").trim() === csvHeader);
  return hit ?? "";
}

export interface CsvColumnMappingModalProps {
  open: boolean;
  fileName: string;
  headers: string[];
  sampleData: Record<string, string>[];
  parsedRows: Record<string, string>[] | null;
  onParsedCellChange: (rowIndex: number, columnKey: string, value: string) => void;
  /** Remove a data row from the editable preview (parsed file only). */
  onParsedRowRemove: (rowIndex: number) => void;
  mapping: Record<string, string>;
  /** Replace full mapping (per-column + auto-map). */
  onMappingReplace: (next: Record<string, string>) => void;
  onAutoMap: () => void;
  onConfirm: () => void;
  onReupload: () => void;
  isProcessing: boolean;
}

function CsvColumnMappingModal({
  open,
  fileName,
  headers,
  sampleData,
  parsedRows,
  onParsedCellChange,
  onParsedRowRemove,
  mapping,
  onMappingReplace,
  onAutoMap,
  onConfirm,
  onReupload,
  isProcessing,
}: CsvColumnMappingModalProps) {
  const [validationState, setValidationState] = useState<"idle" | "ok" | "error">("idle");

  useEffect(() => {
    if (!open) setValidationState("idle");
  }, [open]);

  const previewColumns = headers;
  const displayRows = useMemo(() => {
    if (parsedRows != null) return parsedRows;
    return sampleData;
  }, [parsedRows, sampleData]);
  const previewEditable = parsedRows != null;
  const rowCount = displayRows.length;
  const columnCount = headers.length;

  const canConfirm = useMemo(() => {
    const sku = (mapping.sku ?? "").trim();
    const price = (mapping.current_price ?? "").trim();
    return Boolean(sku && price && headers.length > 0 && rowCount > 0);
  }, [mapping.sku, mapping.current_price, headers.length, rowCount]);

  const mappedHeaderSet = useMemo(() => {
    const s = new Set<string>();
    for (const k of CSV_SYSTEM_FIELD_KEYS) {
      const h = (mapping[k] ?? "").trim();
      if (h) s.add(h);
    }
    return s;
  }, [mapping]);

  const columnsMappedCount = mappedHeaderSet.size;

  const errorsFound = useMemo(() => {
    let n = 0;
    if (!(mapping.sku ?? "").trim()) n += 1;
    if (!(mapping.current_price ?? "").trim()) n += 1;
    return n;
  }, [mapping.sku, mapping.current_price]);

  const handleColumnRoleChange = useCallback(
    (csvHeader: string, value: string) => {
      const field = (value === "" ? "" : value) as CsvSystemFieldKey | "";
      onMappingReplace(assignCsvColumnToField(mapping, csvHeader, field));
    },
    [mapping, onMappingReplace],
  );

  const handleValidate = useCallback(() => {
    if (canConfirm) setValidationState("ok");
    else setValidationState("error");
  }, [canConfirm]);

  const displayName = fileName.trim() || "upload.csv";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !isProcessing) onReupload();
      }}
    >
      <DialogContent
        className={cn(
          "flex max-h-[min(92vh,880px)] w-[calc(100%-1.5rem)] max-w-[min(96vw,56rem)] flex-col gap-0 p-0",
          "border-ithina-border bg-[#12141D] shadow-2xl",
        )}
        showClose={!isProcessing}
      >
        <DialogHeader className="shrink-0 border-b border-ithina-border/80 bg-[#12141D] px-6 pb-4 pt-6 pr-14">
          <DialogTitle className="text-lg font-bold text-white">Import &amp; Map CSV Data</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-slate-400">
            Review and edit your data before importing. Make any necessary changes.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {/* File bar */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ithina-border bg-ithina-bg/60 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-ithina-border/80 bg-ithina-panel">
                <FileSpreadsheet className="size-5 text-ithina-purple" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="truncate font-mono text-sm font-semibold text-white">{displayName}</p>
                <p className="text-xs text-slate-500">
                  {rowCount} rows · {columnCount} columns
                </p>
              </div>
            </div>
            <button
              type="button"
              disabled={isProcessing}
              onClick={onReupload}
              className="shrink-0 rounded-lg border border-ithina-border bg-transparent px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:border-slate-500 hover:text-white disabled:opacity-50"
            >
              Replace File
            </button>
          </div>

          {/* Stats */}
          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-ithina-border bg-ithina-bg/40 px-4 py-3 text-center sm:text-left">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Rows found</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-sky-400">{rowCount}</p>
            </div>
            <div className="rounded-xl border border-ithina-border bg-ithina-bg/40 px-4 py-3 text-center sm:text-left">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Columns mapped</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-sky-400">{columnsMappedCount}</p>
            </div>
            <div className="rounded-xl border border-ithina-border bg-ithina-bg/40 px-4 py-3 text-center sm:text-left">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Errors found</p>
              <p
                className={cn(
                  "mt-1 text-2xl font-semibold tabular-nums",
                  errorsFound > 0 ? "text-rose-400" : "text-emerald-400",
                )}
              >
                {errorsFound}
              </p>
            </div>
          </div>

          {/* Map columns */}
          <div className="mb-6 rounded-xl border border-ithina-border/80 bg-ithina-bg/30 p-4">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-white">Map columns</h3>
                <p className="text-xs text-slate-500">Ensure each column is mapped to the correct field.</p>
              </div>
              <button
                type="button"
                disabled={isProcessing}
                onClick={onAutoMap}
                className="inline-flex items-center gap-1.5 rounded-lg border border-ithina-border bg-ithina-panel px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-ithina-purple/50 hover:text-white disabled:opacity-50"
              >
                <Wand2 className="size-3.5" aria-hidden />
                Auto map
              </button>
            </div>
            {headers.length === 0 ? (
              <p className="text-xs text-slate-500">No columns detected in this file.</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {headers.map((header) => {
                  const role = fieldRoleForColumn(mapping, header);
                  return (
                    <div key={header} className="min-w-[8.5rem] flex-1">
                      <label className="mb-1 block truncate font-mono text-[10px] font-medium uppercase tracking-wide text-slate-500">
                        {header}
                      </label>
                      <select
                        value={role}
                        disabled={isProcessing}
                        onChange={(e) =>
                          handleColumnRoleChange(header, e.target.value as CsvSystemFieldKey | "")
                        }
                        className={cn(
                          "w-full rounded-lg border border-ithina-border bg-ithina-bg px-2.5 py-2 text-xs text-white",
                          "focus:border-ithina-purple focus:outline-none focus:ring-1 focus:ring-ithina-purple/30",
                          "disabled:opacity-50",
                        )}
                      >
                        <option value="">— Ignore —</option>
                        {CSV_SYSTEM_FIELD_KEYS.map((key) => {
                          const { label, required } = FIELD_LABELS[key];
                          return (
                            <option key={key} value={key}>
                              {label}
                              {required ? " *" : ""}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="rounded-xl border border-ithina-border/80 bg-ithina-bg/20">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ithina-border/60 px-4 py-3">
              <h3 className="text-sm font-semibold text-white">
                Preview data ({rowCount} {rowCount === 1 ? "row" : "rows"})
              </h3>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleValidate}
                className="inline-flex items-center gap-1.5 rounded-lg border border-ithina-border bg-ithina-panel px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-ithina-purple/50 hover:text-white disabled:opacity-50"
              >
                <RefreshCw className="size-3.5" aria-hidden />
                Validate data
              </button>
            </div>
            <div className="max-h-[min(40vh,320px)] overflow-auto">
              {previewColumns.length === 0 ? (
                <p className="p-4 text-xs text-slate-500">No preview rows available.</p>
              ) : (
                <table className="w-full border-collapse text-left text-xs">
                  <thead className="sticky top-0 z-[1] bg-[#1a1f2e] shadow-sm">
                    <tr className="border-b border-ithina-border text-slate-400">
                      {previewColumns.map((col) => (
                        <th key={col} className="whitespace-nowrap px-3 py-2.5 font-semibold uppercase tracking-wide">
                          {col}
                        </th>
                      ))}
                      <th className="w-[4.5rem] min-w-[4.5rem] px-2 py-2.5 text-center font-semibold text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayRows.map((row, i) => (
                      <tr
                        key={i}
                        className="border-b border-ithina-border/40 text-slate-300 transition-colors hover:bg-white/[0.02]"
                      >
                        {previewColumns.map((col) => (
                          <td key={col} className="max-w-[11rem] px-2 py-1.5 align-middle font-mono">
                            {previewEditable ? (
                              <input
                                type="text"
                                value={row[col] ?? ""}
                                disabled={isProcessing}
                                onChange={(e) => onParsedCellChange(i, col, e.target.value)}
                                className={cn(
                                  "w-full min-w-[3rem] rounded-md border border-ithina-border/70 bg-[#0f1419] px-2 py-1 text-[11px] text-slate-200",
                                  "focus:border-ithina-purple focus:outline-none disabled:opacity-50",
                                )}
                              />
                            ) : (
                              <span className="block max-w-[11rem] truncate px-1 py-0.5">{row[col] ?? "—"}</span>
                            )}
                          </td>
                        ))}
                        <td className="px-1 py-1 text-center align-middle">
                          <div className="inline-flex items-center justify-center gap-0.5">
                            <span
                              className="inline-flex text-slate-600"
                              title={previewEditable ? "Editable row" : "Read-only preview"}
                            >
                              <Pencil className="size-3.5" aria-hidden />
                            </span>
                            {previewEditable ? (
                              <button
                                type="button"
                                disabled={isProcessing}
                                onClick={() => onParsedRowRemove(i)}
                                className="inline-flex rounded-md p-1 text-slate-500 transition-colors hover:bg-rose-500/15 hover:text-rose-400 disabled:opacity-50"
                                aria-label={`Remove row ${i + 1}`}
                                title="Remove this row from import"
                              >
                                <Trash2 className="size-3.5" aria-hidden />
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-ithina-border/60 px-4 py-3">
              {validationState === "ok" && (
                <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
                  <CheckCircle2 className="size-4 shrink-0" aria-hidden />
                  All rows look good!
                </div>
              )}
              {validationState === "error" && (
                <div className="flex items-center gap-2 text-xs font-medium text-rose-400">
                  <span className="text-rose-300">Map required fields: SKU and Current / Retail Price.</span>
                </div>
              )}
              {validationState === "idle" && (
                <p className="text-[11px] text-slate-600">
                  {previewEditable ? "Cells are editable. Validate before import." : "Sample preview — full file is imported on continue."}
                </p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="shrink-0 flex-wrap justify-between gap-3 border-t border-ithina-border/80 bg-[#12141D] px-6 py-4 sm:justify-between">
          <button
            type="button"
            disabled={isProcessing}
            onClick={onReupload}
            className="rounded-lg border border-ithina-border bg-transparent px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-ithina-bg/50 hover:text-white disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canConfirm || isProcessing}
            onClick={onConfirm}
            className="inline-flex items-center gap-2 rounded-lg bg-ithina-purple px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-colors hover:bg-ithina-purple-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Importing…
              </>
            ) : (
              <>
                <Upload className="size-4" aria-hidden />
                Import &amp; continue
              </>
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default memo(CsvColumnMappingModal);
