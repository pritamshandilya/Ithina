import { memo, useMemo } from "react";

import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import type { QueueRow } from "@/types/fleet";

interface PublishingQueueProps {
  rows: QueueRow[];
  progressCount: number;
  totalCount: number;
  isComplete: boolean;
}

function PublishingQueue({ rows, progressCount, totalCount, isComplete }: PublishingQueueProps) {
  const enrichedRows = useMemo(() => {
    return rows.map((row, i) => {
      const isAnimated = row.animated;
      const pct = isAnimated
        ? Math.floor((progressCount / totalCount) * 100)
        : Math.floor((row.completedTags / row.totalTags) * 100);
      const count = isAnimated ? progressCount : row.completedTags;
      const complete = isAnimated ? isComplete : row.state === "live" || row.state === "completed";
      return { ...row, __pct: pct, __count: count, __complete: complete, __id: String(i) };
    });
  }, [rows, progressCount, totalCount, isComplete]);

  type EnrichedRow = (typeof enrichedRows)[number];

  const columns = useMemo<DataTableColumn<EnrichedRow>[]>(() => [
    {
      title: "Payload Sub-Batch",
      field: "name",
      minWidth: 220,
      hozAlign: "left",
      headerHozAlign: "left",
      formatter: (cell: unknown) => {
        const row = (cell as { getData: () => EnrichedRow }).getData();
        return `<div><span class="block font-medium text-white">${row.name}</span><span class="block font-mono text-[10px] text-slate-500">Target: ${row.target}</span></div>`;
      },
    },
    {
      title: "State",
      field: "state",
      width: 130,
      formatter: (cell: unknown) => {
        const row = (cell as { getData: () => EnrichedRow }).getData();
        if (!row.__complete) {
          return `<span class="inline-flex items-center gap-2 rounded border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 font-mono text-[10px] text-purple-400"><span class="size-1.5 animate-pulse rounded-full bg-purple-400 inline-block"></span>Publishing</span>`;
        }
        const label = row.state === "live" ? "Live" : "Completed";
        return `<span class="inline-flex items-center gap-2 rounded border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 font-mono text-[10px] text-emerald-400">✓ ${label}</span>`;
      },
    },
    {
      title: "API / RF Progress",
      field: "__pct",
      minWidth: 250,
      formatter: (cell: unknown) => {
        const row = (cell as { getData: () => EnrichedRow }).getData();
        const barColor = row.__complete ? "bg-emerald-500 shadow-[0_0_8px_#34d399]" : "bg-purple-500 shadow-[0_0_8px_#a855f7]";
        const pctColor = row.__complete ? "text-emerald-400" : "text-white";
        return `<div>` +
          `<div class="mb-1.5 flex justify-between font-mono text-[10px] text-slate-400">` +
          `<span>${row.__count.toLocaleString()} / ${row.totalTags.toLocaleString()}</span>` +
          `<span class="${pctColor}">${row.__pct}%</span>` +
          `</div>` +
          `<div class="h-1.5 w-full overflow-hidden rounded-full border border-slate-700 bg-black/50">` +
          `<div class="h-full transition-all duration-1000 ease-out ${barColor}" style="width:${row.__pct}%"></div>` +
          `</div></div>`;
      },
    },
    {
      title: "Tags",
      field: "totalTags",
      width: 90,
      sorter: "number",
      formatter: (cell: unknown) => {
        const val = (cell as { getValue: () => number }).getValue();
        return `<span class="font-mono text-slate-300">${val.toLocaleString()}</span>`;
      },
    },
  ], []);

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-ithina-border bg-ithina-panel shadow-xl xl:col-span-2">
      <header className="flex shrink-0 items-center justify-between border-b border-ithina-border bg-white/[0.01] px-6 py-5">
        <h3 className="text-base font-semibold tracking-wide text-white">Publishing Queue</h3>
      </header>
      <DataTable<EnrichedRow>
        columns={columns}
        data={enrichedRows}
        rowIdField="__id"
        emptyMessage="No publishing jobs"
        pagination={false}
        headerFilters={false}
        showRowNumber
        layout="fitColumns"
      />
    </div>
  );
}

export default memo(PublishingQueue);
