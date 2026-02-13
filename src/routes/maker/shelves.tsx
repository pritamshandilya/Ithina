import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search, Store, LayoutGrid, List, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";

import MainLayout from "@/components/layouts/main";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { useAssignedShelves, useCreateShelf } from "@/features/maker/hooks";
import type { Shelf } from "@/types/maker";
import { StoreSelector } from "@/components/store-selector";

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
  const { mutate: createShelf, isPending: isCreating } = useCreateShelf();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [currentPage, setCurrentPage] = useState(1);
  const GRID_PAGE_SIZE = 9;

  // Form State
  const [formData, setFormData] = useState({
    shelfName: "",
    aisleNumber: "",
    bayNumber: "",
    elevation: "",
    notes: "",
  });

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

  // Pagination Logic for Grid
  const totalPages = Math.ceil(filteredShelves.length / GRID_PAGE_SIZE);
  const paginatedGridShelves = filteredShelves.slice(
    (currentPage - 1) * GRID_PAGE_SIZE,
    currentPage * GRID_PAGE_SIZE
  );

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createShelf(
      {
        shelfName: formData.shelfName,
        aisleNumber: parseInt(formData.aisleNumber) || 0,
        bayNumber: parseInt(formData.bayNumber) || 0,
        description: formData.notes,
        // casting needed as mock api might refer to elevation as well
        // @ts-ignore
        elevation: formData.elevation, 
        notes: formData.notes,
      },
      {
        onSuccess: () => {
          setIsSheetOpen(false);
          setFormData({
            shelfName: "",
            aisleNumber: "",
            bayNumber: "",
            elevation: "",
            notes: "",
          });
        },
      }
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "text-green-400 bg-green-400/10 border-green-400/20";
      case "pending": return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "returned": return "text-red-400 bg-red-400/10 border-red-400/20";
      default: return "text-gray-400 bg-gray-400/10 border-gray-400/20";
    }
  };

  return (
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

              {/* Store Selector */}
              <div className="hidden md:block">
                <StoreSelector />
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

              {/* View Toggle */}
              <div className="flex items-center bg-[#1c1c21] rounded-lg p-1 border border-white/5">
                 <button 
                  onClick={() => setViewMode("table")}
                  className={`p-2 rounded-md transition-all ${viewMode === 'table' ? 'bg-[#2a2a35] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                  title="List View"
                >
                  <List className="size-4" />
                </button>
                <button 
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-[#2a2a35] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                  title="Grid View"
                >
                  <LayoutGrid className="size-4" />
                </button>
              </div>

              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button className="bg-[#6366f1] hover:bg-[#5558dd] text-white font-medium px-4 h-10 rounded-lg shadow-lg shadow-indigo-500/20 transition-all active:scale-95">
                    <Plus className="size-4 mr-2" />
                    New Shelf
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-md bg-[#0f1014] border-l border-white/10 text-white p-0">
                  <div className="flex flex-col h-full">
                    <SheetHeader className="p-6 pb-2 space-y-1">
                      <div className="flex items-center gap-2 text-[#6366f1] mb-2">
                        <div className="p-2 rounded-lg bg-[#6366f1]/10">
                          <Plus className="size-5" />
                        </div>
                        <SheetTitle className="text-xl font-bold text-white">Register Shelf</SheetTitle>
                      </div>
                      <SheetDescription className="text-gray-400 text-sm">
                        Configure the geometric and logical metadata for the new shelving unit.
                      </SheetDescription>
                    </SheetHeader>

                    <form onSubmit={handleCreateSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="shelfName" className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Shelf Name
                          </Label>
                          <div className="relative">
                             <Input
                              id="shelfName"
                              placeholder="e.g. Premium Wine Rack A"
                              value={formData.shelfName}
                              onChange={(e) => setFormData(prev => ({ ...prev, shelfName: e.target.value }))}
                              className="bg-[#18181b] border-white/10 text-white placeholder:text-gray-600 focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] transition-all h-11"
                              required
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                               <div className="h-1.5 w-1.5 rounded-full bg-[#6366f1] animate-pulse"></div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="aisleNumber" className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                              Aisle Number
                            </Label>
                            <Input
                              id="aisleNumber"
                              placeholder="Isle 04"
                              value={formData.aisleNumber}
                              onChange={(e) => setFormData(prev => ({ ...prev, aisleNumber: e.target.value }))}
                              className="bg-[#18181b] border-white/10 text-white placeholder:text-gray-600 focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] h-11"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="bayNumber" className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                              Bay Location
                            </Label>
                            <Input
                              id="bayNumber"
                              placeholder="Bay 12"
                              value={formData.bayNumber}
                              onChange={(e) => setFormData(prev => ({ ...prev, bayNumber: e.target.value }))}
                              className="bg-[#18181b] border-white/10 text-white placeholder:text-gray-600 focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] h-11"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="elevation" className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Elevation Level
                          </Label>
                          <Input
                            id="elevation"
                            placeholder="e.g. Eye Level (Top)"
                            value={formData.elevation}
                            onChange={(e) => setFormData(prev => ({ ...prev, elevation: e.target.value }))}
                            className="bg-[#18181b] border-white/10 text-white placeholder:text-gray-600 focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] h-11"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="notes" className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Notes & Observations
                          </Label>
                          <textarea
                            id="notes"
                            placeholder="Describe the shelf's specific purpose or constraints..."
                            value={formData.notes}
                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            className="flex min-h-[120px] w-full rounded-md border border-white/10 bg-[#18181b] px-3 py-2 text-sm ring-offset-background placeholder:text-gray-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#6366f1] focus-visible:border-[#6366f1] disabled:cursor-not-allowed disabled:opacity-50 text-white resize-none"
                          />
                        </div>
                      </div>
                    </form>

                    <SheetFooter className="p-6 border-t border-white/5 bg-[#131316]">
                      <div className="flex w-full justify-between items-center gap-4">
                        <SheetClose asChild>
                          <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/5">
                            Discard
                          </Button>
                        </SheetClose>
                        <Button 
                          onClick={handleCreateSubmit} 
                          disabled={isCreating}
                          className="bg-[#818cf8] hover:bg-[#6366f1] text-[#0f1014] font-semibold w-full sm:w-auto min-w-[120px]"
                        >
                          {isCreating ? "Creating..." : "Create Shelf"}
                        </Button>
                      </div>
                    </SheetFooter>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Content Area */}
          <div className="min-h-[500px]">
             {isLoading ? (
               <div className="flex items-center justify-center h-64 text-gray-500">
                 Loading shelf data...
               </div>
             ) : filteredShelves.length === 0 ? (
               <div className="text-center py-20 text-gray-500">
                  No shelves found. Try adjusting your search query.
               </div>
             ) : viewMode === "table" ? (
                <div className="rounded-xl border border-white/5 bg-[#131316] shadow-xl overflow-hidden">
                   <DataTable
                     columns={SHELF_COLUMNS}
                     data={filteredShelves}
                     emptyMessage="No shelves found matching your search."
                     pagination={true}
                     pageSize={10}
                     className="border-none bg-transparent"
                   />
                </div>
             ) : (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedGridShelves.map((shelf) => (
                      <div 
                        key={shelf.id} 
                        className="group bg-[#131316] border border-white/5 rounded-xl p-5 hover:border-[#6366f1]/50 transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] flex flex-col gap-4 relative overflow-hidden"
                      >
                         <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="text-gray-400 hover:text-white">
                               <MoreHorizontal className="size-5" />
                            </button>
                         </div>

                         <div className="space-y-1 pr-6">
                            <h3 className="font-semibold text-lg text-white truncate" title={shelf.shelfName}>
                              {shelf.shelfName}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                               <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono">
                                 Aisle {String(shelf.aisleNumber).padStart(2,'0')}
                               </span>
                               <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono">
                                 Bay {String(shelf.bayNumber).padStart(2,'0')}
                               </span>
                            </div>
                         </div>

                         <div className="flex items-center justify-between pt-2 border-t border-white/5">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${getStatusColor(shelf.status)}`}>
                               {shelf.status.replace("-", " ")}
                            </span>
                            {/* @ts-ignore */}
                            {shelf.elevation && (
                               <span className="text-xs text-gray-500 font-medium">
                                 {/* @ts-ignore */}
                                 {shelf.elevation}
                               </span>
                            )}
                         </div>

                         <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
                            <span>
                               {shelf.lastAuditDate 
                                 ? `Modified ${format(new Date(shelf.lastAuditDate), "MMM d")}`
                                 : "Never modified"
                               }
                            </span>
                            {shelf.notes && (
                               <span className="truncate max-w-[120px]" title={shelf.notes}>
                                 {shelf.notes}
                               </span>
                            )}
                         </div>
                      </div>
                    ))}
                  </div>

                  {/* Grid Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between py-4 border-t border-white/5">
                       <div className="text-sm text-gray-500">
                          Showing {Math.min(filteredShelves.length, (currentPage - 1) * GRID_PAGE_SIZE + 1)}-
                          {Math.min(filteredShelves.length, currentPage * GRID_PAGE_SIZE)} of {filteredShelves.length}
                       </div>
                       <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-[#1c1c21] border-white/10 text-gray-300 hover:bg-[#2a2a35] hover:text-white"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                          >
                             <ChevronLeft className="size-4" />
                          </Button>
                          <div className="text-sm text-gray-400 font-medium px-2">
                             Page {currentPage} of {totalPages}
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-[#1c1c21] border-white/10 text-gray-300 hover:bg-[#2a2a35] hover:text-white"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                          >
                             <ChevronRight className="size-4" />
                          </Button>
                       </div>
                    </div>
                  )}
                </div>
             )}
          </div>
          
           {/* Footer Info */}
           <div className="flex justify-between items-center text-xs text-gray-600 px-2">
             <p>Last synced: Just now</p>
             <p>{filteredShelves.length} total shelves</p>
           </div>
        </div>
      </div>
  );
}
