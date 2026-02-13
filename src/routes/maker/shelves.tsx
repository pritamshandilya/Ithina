import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search, Store } from "lucide-react";

import MainLayout from "@/components/layouts/main";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { useAssignedShelves } from "@/features/maker/hooks";
import type { Shelf } from "@/types/maker";
import { format } from "date-fns";

export const Route = createFileRoute("/maker/shelves")({
  component: ShelfManagementPage,
});

/**
 * Column definitions for the shelf management table
 */
const SHELF_COLUMNS: DataTableColumn<Shelf>[] = [
  {
    title: "Shelf Name",
    field: "shelfName",
    sorter: "string",
    headerSort: true,
    formatter: (cell: any) => {
      const shelf = cell.getData() as Shelf;
      const statusColor =
        shelf.status === "approved"
          ? "bg-green-500/20 text-green-400"
          : shelf.status === "pending"
          ? "bg-yellow-500/20 text-yellow-400"
          : shelf.status === "returned"
          ? "bg-red-500/20 text-red-400"
          : "bg-gray-500/20 text-gray-400";

      return `
        <div class="flex flex-col gap-1 py-1">
          <span class="font-medium text-white">${shelf.shelfName}</span>
          <span class="inline-flex items-center w-fit rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${statusColor}">
            ${shelf.status.replace("-", " ")}
          </span>
        </div>
      `;
    },
  },
  {
    title: "Location",
    field: "aisleNumber",
    sorter: "number",
    headerSort: true,
    formatter: (cell: any) => {
      const shelf = cell.getData() as Shelf;
      return `
        <div class="flex items-center justify-center h-full">
          <span class="font-mono text-sm bg-accent/20 px-2 py-1 rounded text-accent">
            ${String(shelf.aisleNumber).padStart(2, "0")} / ${String(shelf.bayNumber).padStart(2, "0")}
          </span>
        </div>
      `;
    },
    headerHozAlign: "center",
  },
  {
    title: "Elevation",
    field: "elevation",
    sorter: "string",
    headerSort: true,
    formatter: (cell: any) => {
      const value = cell.getValue() || "—";
      return `<span class="text-sm font-medium text-gray-300">${value}</span>`;
    },
  },
  {
    title: "Last Modified",
    field: "lastAuditDate",
    sorter: "date",
    headerSort: true,
    formatter: (cell: any) => {
      const date = cell.getValue();
      if (!date) return `<span class="text-muted-foreground text-xs italic">Never</span>`;
      return `<span class="text-sm text-gray-300">${format(new Date(date), "MMM d, yyyy")}</span>`;
    },
  },
  {
    title: "Notes",
    field: "notes",
    sorter: "string",
    formatter: (cell: any) => {
      const value = cell.getValue();
      if (!value) return "";
      return `<span class="text-sm text-gray-400 italic truncate block max-w-[200px]" title="${value}">${value}</span>`;
    },
  },
  {
    title: "Actions",
    field: "actions",
    formatter: () => {
      return `
        <button class="p-1.5 hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ellipsis"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
        </button>
      `;
    },
    width: 80,
    headerSort: false,
    headerHozAlign: "center",
    hozAlign: "center",
  },
];

function ShelfManagementPage() {
  const { data: shelves, isLoading } = useAssignedShelves();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredShelves = shelves?.filter((shelf) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      shelf.shelfName.toLowerCase().includes(query) ||
      shelf.notes?.toLowerCase().includes(query) ||
      String(shelf.aisleNumber).includes(query) ||
      String(shelf.bayNumber).includes(query)
    );
  }) || [];

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#0a0a0c] text-white p-6">
        <div className="mx-auto max-w-[1600px] space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-[#131316] p-4 rounded-xl border border-white/5 shadow-sm">
            <div className="flex items-center gap-6">
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Shelf Management
                </h1>
                <p className="text-[10px] uppercase tracking-widest text-[#6c6c75] font-semibold mt-0.5">
                  Planogram Designer v1.0
                </p>
              </div>

              {/* Store Selector (Visual Only) */}
              <div className="hidden md:flex items-center gap-2 bg-[#1c1c21] px-3 py-1.5 rounded-full border border-white/5 text-sm text-gray-300">
                <Store className="size-4 text-[#8a8a93]" />
                <span>Store #1234 - Downtown</span>
                <span className="text-[#8a8a93] text-xs">▼</span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
                <Input
                  className="pl-9 bg-[#1c1c21] border-white/5 text-sm text-white placeholder:text-gray-600 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary/50 h-10 rounded-lg transition-all hover:bg-[#232329]"
                  placeholder="Quick search shelves..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button className="bg-[#6366f1] hover:bg-[#5558dd] text-white font-medium px-4 h-10 rounded-lg shadow-lg shadow-indigo-500/20 transition-all active:scale-95">
                <Plus className="size-4 mr-2" />
                New Shelf
              </Button>
            </div>
          </div>

          {/* Data Table */}
          <div className="rounded-xl border border-white/5 bg-[#131316] shadow-xl overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center h-64 text-gray-500">
                Loading shelf data...
              </div>
            ) : (
              <DataTable
                columns={SHELF_COLUMNS}
                data={filteredShelves}
                emptyMessage="No shelves found matching your search."
                pagination={true}
                pageSize={10}
                className="border-none bg-transparent"
              />
            )}
          </div>
          
           {/* Footer Info */}
           <div className="flex justify-between items-center text-xs text-gray-600 px-2">
             <p>Last synced: Just now</p>
             <p>{filteredShelves.length} total shelves</p>
           </div>
        </div>
      </div>
    </MainLayout>
  );
}
