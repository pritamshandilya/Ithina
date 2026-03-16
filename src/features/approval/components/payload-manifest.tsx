import { memo, useMemo } from "react";

import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import type { PayloadRow } from "@/types/approval";

interface PayloadManifestProps {
  rows: PayloadRow[];
}

function PayloadManifest({ rows }: PayloadManifestProps) {
  const columns = useMemo<DataTableColumn<PayloadRow>[]>(() => [
    {
      title: "SKU",
      field: "sku",
      width: 110,
      formatter: (cell: unknown) => {
        const row = (cell as { getData: () => PayloadRow }).getData();
        const cls = row.marginStatus === "alert" ? "text-rose-400/80" : "text-slate-400";
        return `<span class="font-mono text-xs ${cls}">${row.sku}</span>`;
      },
    },
    {
      title: "Product Description",
      field: "name",
      minWidth: 200,
      hozAlign: "left",
      headerHozAlign: "left",
      formatter: (cell: unknown) => {
        const row = (cell as { getData: () => PayloadRow }).getData();
        const cls = row.marginStatus === "alert" ? "text-slate-200" : "text-slate-300";
        return `<span class="${cls}">${row.name}</span>`;
      },
    },
    {
      title: "Old Price",
      field: "oldPrice",
      width: 100,
      sorter: "number",
      hozAlign: "right",
      headerHozAlign: "right",
      formatter: (cell: unknown) => {
        const val = (cell as { getValue: () => number }).getValue();
        return `<span class="font-mono text-slate-500 line-through">$${val.toFixed(2)}</span>`;
      },
    },
    {
      title: "New Price",
      field: "newPrice",
      width: 100,
      sorter: "number",
      hozAlign: "right",
      headerHozAlign: "right",
      formatter: (cell: unknown) => {
        const row = (cell as { getData: () => PayloadRow }).getData();
        const cls = row.marginStatus === "alert" ? "font-bold" : "font-medium";
        return `<span class="font-mono text-white ${cls}">$${row.newPrice.toFixed(2)}</span>`;
      },
    },
    {
      title: "Margin Rule",
      field: "marginStatus",
      width: 130,
      formatter: (cell: unknown) => {
        const row = (cell as { getData: () => PayloadRow }).getData();
        if (row.marginStatus === "pass") {
          return `<span class="font-mono text-[10px] text-emerald-400">PASS</span>`;
        }
        return `<span class="rounded border border-rose-400/30 bg-rose-400/10 px-2 py-0.5 font-mono text-[10px] font-bold text-rose-400">ALERT (${row.marginValue})</span>`;
      },
    },
  ], []);

  const rowFormatter = useMemo(() => (row: { getData: () => PayloadRow; getElement: () => HTMLElement }) => {
    const data = row.getData();
    if (data.marginStatus === "alert") {
      const el = row.getElement();
      el.style.borderLeft = "2px solid rgb(251 113 133)";
      el.style.backgroundColor = "rgba(127, 29, 29, 0.2)";
    }
  }, []);

  return (
    <div className="flex min-h-[150px] flex-1 flex-col">
      <h3 className="mb-3 shrink-0 font-mono text-xs uppercase tracking-widest text-ithina-muted">
        API Payload Manifest
      </h3>
      <DataTable<PayloadRow>
        columns={columns}
        data={rows}
        rowIdField="sku"
        emptyMessage="No payload items"
        pagination={false}
        headerFilters={false}
        showRowNumber
        layout="fitColumns"
        rowFormatter={rowFormatter}
      />
    </div>
  );
}

export default memo(PayloadManifest);
