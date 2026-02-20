import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { renderToString } from "react-dom/server";
import { Plus, Search, LayoutGrid, List } from "lucide-react";

import MainLayout from "@/components/layouts/main";
import { ShelfCard, ShelfActions } from "@/components/maker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { useAssignedShelves } from "@/features/maker/hooks";
import { AUDIT_STATUS_LABELS, getAuditStatusClass } from "@/lib/constants/maker";
// import { mockUser } from "@/lib/api/mock-data";
import { cn } from "@/lib/utils";
import type { Shelf } from "@/types/maker";
// import { useStore } from "@/providers/store";

export const Route = createFileRoute("/checker/shelves")({
  component: ShelfManagementPage,
});

const SHELF_COLUMNS: DataTableColumn<Shelf>[] = [
  {
    title: "Shelf Name",
    field: "shelfName",
    sorter: "string",
    headerSort: true,
    formatter: (cell: unknown) => {
      const shelf = (cell as { getData: () => Shelf }).getData();
      const statusClass = getAuditStatusClass(shelf.status);
      const label = AUDIT_STATUS_LABELS[shelf.status] ?? shelf.status;

      return `
        <div class="flex flex-col gap-1 py-1">
          <span class="font-medium text-foreground">${shelf.shelfName}</span>
          <span class="inline-flex items-center w-fit rounded-md px-2 py-0.5 text-xs font-medium ${statusClass}">
            ${label}
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
    formatter: (cell: unknown) => {
      const shelf = (cell as { getData: () => Shelf }).getData();
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
  // {
  //   title: "Elevation",
  //   field: "elevation",
  //   sorter: "string",
  //   headerSort: true,
  //   formatter: (cell: unknown) => {
  //     const value = (cell as { getValue: () => unknown }).getValue() || "—";
  //     return `<span class="text-sm font-medium text-muted-foreground">${value}</span>`;
  //   },
  // },
  {
    title: "Last Modified",
    field: "lastAuditDate",
    sorter: "date",
    headerSort: true,
    formatter: (cell: unknown) => {
      const date = (cell as { getValue: () => unknown }).getValue();
      if (!date) return `<span class="text-muted-foreground text-xs italic">Never</span>`;
      return `<span class="text-sm text-foreground">${format(new Date(date as string | number), "MMM d, yyyy")}</span>`;
    },
  },
  // {
  //   title: "Notes",
  //   field: "notes",
  //   sorter: "string",
  //   formatter: (cell: unknown) => {
  //     const value = (cell as { getValue: () => unknown }).getValue();
  //     if (!value) return "";
  //     return `<span class="text-sm text-muted-foreground italic truncate block max-w-[200px]" title="${String(value)}">${String(value)}</span>`;
  //   },
  // },
  {
    title: "Actions",
    field: "actions",
    formatter: () => {
      // const wrapper = document.createElement("div");
      // wrapper.className = "flex items-center justify-center h-full w-full";
      
      // const root = createRoot(wrapper);
      // root.render(<ShelfActions />);
      
      // return wrapper;
      return renderToString(<ShelfActions />);
    },
    width: 140,
    headerSort: false,
    headerHozAlign: "center",
    hozAlign: "center",
  },
];

function ShelfManagementPage() {
  const { data: shelves, isLoading } = useAssignedShelves();
  // const { data: stores } = useStores();
  // const [selectedStoreId, setSelectedStoreId] = useState(() => mockUser.storeId);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [tablePagination, setTablePagination] = useState({ page: 1, pageSize: 10 });
  const [currentPage, setCurrentPage] = useState(1);
  const GRID_PAGE_SIZE = 9;

  const filteredShelves =
    shelves?.filter((shelf) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        shelf.shelfName.toLowerCase().includes(query) ||
        shelf.notes?.toLowerCase().includes(query) ||
        String(shelf.aisleNumber).includes(query) ||
        String(shelf.bayNumber).includes(query)
      );
    }) ?? [];

  const tableVisibleCount =
    viewMode === "table"
      ? Math.max(
          0,
          Math.min(
            tablePagination.pageSize,
            filteredShelves.length - (tablePagination.page - 1) * tablePagination.pageSize
          )
        )
      : 0;

  // Reset pagination when search changes
  useEffect(() => {
    setTablePagination((p) => ({ ...p, page: 1 }));
    setCurrentPage(1);
  }, [searchQuery]);

  // Pagination Logic for Grid
  const totalPages = Math.ceil(filteredShelves.length / GRID_PAGE_SIZE);
  const paginatedGridShelves = filteredShelves.slice(
    (currentPage - 1) * GRID_PAGE_SIZE,
    currentPage * GRID_PAGE_SIZE
  );

  return (
    <MainLayout>
      <div className="min-h-screen bg-primary p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">

          {/* Header Bar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-border bg-card p-4 shadow-sm">
            <header className="space-y-1">
              <h1 className="text-2xl font-bold text-foreground">Shelf Management</h1>
              <p className="text-sm text-muted-foreground">
                Create and manage shelves with aisle, bay, and elevation metadata
              </p>
            </header>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" aria-hidden />
                <Input
                  className="pl-9 h-10"
                  placeholder="Quick search shelves..."
                  aria-label="Search shelves"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* View Toggle */}
              <div className="flex rounded-lg border border-border p-0.5 bg-card" role="tablist" aria-label="View mode">
                <button
                  type="button"
                  role="tab"
                  aria-selected={viewMode === "table"}
                  onClick={() => setViewMode("table")}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    viewMode === "table"
                      ? "bg-accent text-accent-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                    )}
                >
                  <List className="size-4" aria-hidden="true" />
                  Table
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={viewMode === "grid"}
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    viewMode === "grid"
                      ? "bg-accent text-accent-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                  )}
                >
                  <LayoutGrid className="size-4" aria-hidden="true" />
                  Cards
                </button>
              </div>

              {/* <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild> */}
                  <Button onClick={() => navigate({ to: "/checker/shelf/new" })} className="bg-chart-2 text-white hover:opacity-90">
                    <Plus className="size-4 mr-2" />
                    New Shelf
                  </Button>
                {/* </SheetTrigger> */}
                {/* <SheetContent className="w-full sm:max-w-md p-0">
                  <div className="flex flex-col h-full">
                    <SheetHeader className="p-6 pb-2 space-y-1">
                      <div className="flex items-center gap-2 text-accent mb-2">
                        <div className="p-2 rounded-lg bg-accent/10">
                          <Plus className="size-5" />
                        </div>
                        <SheetTitle className="text-xl font-bold text-foreground">Register Shelf</SheetTitle>
                      </div>
                      <SheetDescription className="text-muted-foreground text-sm">
                        Configure the geometric and logical metadata for the new shelving unit.
                      </SheetDescription>
                    </SheetHeader>

                    <form onSubmit={handleCreateSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="shelfName" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Shelf Name
                          </Label>
                          <Input
                            id="shelfName"
                            placeholder="e.g. Premium Wine Rack A"
                            value={formData.shelfName}
                            onChange={(e) => setFormData((prev) => ({ ...prev, shelfName: e.target.value }))}
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="aisleNumber" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Aisle Number
                            </Label>
                            <Input
                              id="aisleNumber"
                              placeholder="e.g. 04"
                              value={formData.aisleNumber}
                              onChange={(e) => setFormData((prev) => ({ ...prev, aisleNumber: e.target.value }))}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="bayNumber" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Bay Location
                            </Label>
                            <Input
                              id="bayNumber"
                              placeholder="e.g. 12"
                              value={formData.bayNumber}
                              onChange={(e) => setFormData((prev) => ({ ...prev, bayNumber: e.target.value }))}
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="planogramId" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Planogram
                          </Label>
                          <Select
                            id="planogramId"
                            value={formData.planogramId}
                            onChange={(e) => setFormData((prev) => ({ ...prev, planogramId: e.target.value }))}
                          >
                            <option value="">Select a planogram</option>
                            <option value="pog-001">POG-001 - Beverages Section</option>
                            <option value="pog-002">POG-002 - Snacks & Chips</option>
                            <option value="pog-003">POG-003 - Dairy Products</option>
                            <option value="pog-004">POG-004 - Frozen Foods</option>
                            <option value="pog-005">POG-005 - Bakery Items</option>
                            <option value="pog-006">POG-006 - Personal Care</option>
                          </Select>
                          <PlanogramPreview planogramId={formData.planogramId} />
                        </div>
                      </div>
                    </form>

                    <SheetFooter className="p-6 border-t border-border bg-muted/30">
                      <div className="flex w-full justify-between items-center gap-4">
                        <SheetClose asChild>
                          <Button variant="outline">Discard</Button>
                        </SheetClose>
                        <Button
                          onClick={handleCreateSubmit}
                          disabled={isCreating}
                          className="bg-chart-2 text-white hover:opacity-90"
                        >
                          {isCreating ? "Creating..." : "Create Shelf"}
                        </Button>
                      </div>
                    </SheetFooter>
                  </div>
                </SheetContent> */}
              {/* </Sheet> */}
            </div>
          </div>

          {/* Content Area */}
          <div className="min-h-[500px] space-y-4">
            {!isLoading && filteredShelves.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  Showing{" "}
                  <span className="font-semibold text-foreground">
                    {viewMode === "table" ? tableVisibleCount : paginatedGridShelves.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-foreground">{filteredShelves.length}</span>{" "}
                  shelves
                </p>
              </div>
            )}
            {isLoading ? (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                Loading shelf data...
              </div>
            ) : filteredShelves.length === 0 ? (
              <div className="rounded-lg border border-border bg-card p-12 text-center">
                <p className="text-lg font-semibold text-foreground">No shelves found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your search query or create a new shelf.
                </p>
              </div>
            ) : viewMode === "table" ? (
              <DataTable
                columns={SHELF_COLUMNS}
                data={filteredShelves}
                rowIdField="id"
                initialSort={{ field: "shelfName", dir: "asc" }}
                emptyMessage="No shelves found matching your search."
                pageSize={10}
                pageSizeSelector={[5, 10, 20, 50]}
                onPaginationChange={setTablePagination}
              />
            ) : (
              <div className="space-y-4">
                <div className="dashboard-grid">
                  {paginatedGridShelves.map((shelf) => (
                    <ShelfCard key={shelf.id} shelf={shelf} />
                  ))}
                </div>
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page <span className="font-semibold text-foreground">{currentPage}</span> of{" "}
                    <span className="font-semibold text-foreground">{totalPages}</span>
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="flex justify-between items-center text-xs text-muted-foreground px-2">
            <p>Last synced: Just now</p>
            <p>{filteredShelves.length} total shelves</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
