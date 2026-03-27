import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { renderToString } from "react-dom/server";
import { Plus, Search, LayoutGrid, List } from "lucide-react";

import MainLayout from "@/components/layouts/main";
import { ShelfCard, ShelfActions } from "@/components/maker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { useShelves } from "@/queries/maker";
import { AUDIT_STATUS_LABELS, getAuditStatusClass } from "@/lib/constants/maker";
import { cn } from "@/lib/utils";
import type { Shelf } from "@/types/maker";

export const Route = createFileRoute("/maker/shelves/")({
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
    title: "ID",
    field: "shelfCode",
    sorter: "string",
    width: 120,
    headerSort: true,
    formatter: (cell: unknown) => {
      const shelf = (cell as { getData: () => Shelf }).getData();
      return `<span class="font-mono text-sm font-medium text-foreground">${shelf.shelfCode ?? shelf.shelf_id ?? "—"}</span>`;
    },
  },
  {
    title: "Location",
    field: "zone",
    minWidth: 180,
    sorter: "string",
    headerSort: true,
    formatter: (cell: unknown) => {
      const shelf = (cell as { getData: () => Shelf }).getData();
      return `
        <div class="flex flex-col gap-1 py-1">
          <span class="font-medium text-foreground">${shelf.aisleCode ?? (shelf.aisleNumber != null ? `A${shelf.aisleNumber}` : "—")}</span>
          <span class="text-xs text-muted-foreground">${shelf.zone ?? "—"} · ${shelf.section ?? "—"}</span>
        </div>
      `;
    },
  },
  {
    title: "Fixture",
    field: "fixtureType",
    minWidth: 180,
    sorter: "string",
    headerSort: true,
    formatter: (cell: unknown) => {
      const shelf = (cell as { getData: () => Shelf }).getData();
      const type = shelf.fixtureType?.replace(/_/g, " ") ?? "—";
      return `
        <div class="flex flex-col gap-1 py-1">
          <span class="text-sm font-medium text-foreground">${type}</span>
          <span class="text-xs text-muted-foreground">${shelf.dimensions ?? "—"}</span>
        </div>
      `;
    },
  },
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
  const { data: shelves, isLoading } = useShelves();
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [tablePagination, setTablePagination] = useState({ page: 1, pageSize: 10 });
  const [currentPage, setCurrentPage] = useState(1);
  const GRID_PAGE_SIZE = 9;

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setTablePagination((prev) => (prev.page === 1 ? prev : { ...prev, page: 1 }));
    setCurrentPage(1);
  };

  const filteredShelves =
    shelves?.filter((shelf) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        shelf.shelfName.toLowerCase().includes(query) ||
        shelf.shelfCode?.toLowerCase().includes(query) ||
        shelf.aisleCode?.toLowerCase().includes(query) ||
        shelf.zone?.toLowerCase().includes(query) ||
        shelf.section?.toLowerCase().includes(query) ||
        shelf.fixtureType?.toLowerCase().includes(query) ||
        shelf.notes?.toLowerCase().includes(query) ||
        String(shelf.aisleCode ?? "").includes(query) ||
        String(shelf.bayCode ?? "").includes(query) ||
        String(shelf.aisleNumber ?? "").includes(query) ||
        String(shelf.bayNumber ?? "").includes(query)
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

  // Pagination Logic for Grid
  const totalPages = Math.max(1, Math.ceil(filteredShelves.length / GRID_PAGE_SIZE));
  const visibleCurrentPage = Math.min(currentPage, totalPages);
  const paginatedGridShelves = filteredShelves.slice(
    (visibleCurrentPage - 1) * GRID_PAGE_SIZE,
    visibleCurrentPage * GRID_PAGE_SIZE
  );

  return (
    <MainLayout>
      <div className="min-h-screen bg-primary pt-2 px-2 pb-4 sm:pt-3 sm:px-2 sm:pb-4 lg:pt-4 lg:px-2 lg:pb-5">
        <div className="mx-auto max-w-screen-2xl space-y-4">

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
                  onChange={(e) => handleSearchChange(e.target.value)}
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
              <Button
                onClick={() =>
                  navigate({
                    to: "/maker/audits/planogram/new",
                    search: { shelfId: undefined },
                  })
                }
                variant="success"
              >
                <Plus className="size-4 mr-2" />
                New Shelf
              </Button>
              {/* </SheetTrigger> */}
                {/* <SheetContent className="w-full sm:max-w-md p-0">
                  <div className="flex flex-col h-full">
                    <SheetHeader className="p-4 pb-2 space-y-1">
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

                    <form onSubmit={handleCreateSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
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

                    <SheetFooter className="p-4 border-t border-border bg-muted/30">
                      <div className="flex w-full justify-between items-center gap-4">
                        <SheetClose asChild>
                          <Button variant="outline">Discard</Button>
                        </SheetClose>
                        <Button
                          onClick={handleCreateSubmit}
                          disabled={isCreating}
                          variant="success"
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
                layout="fitDataTable"
                onPaginationChange={setTablePagination}
              />
            ) : (
              <div className="space-y-4">
                <div className="dashboard-grid">
                  {paginatedGridShelves.map((shelf) => (
                    <ShelfCard
                      key={shelf.id}
                      shelf={shelf}
                      onClick={(id) =>
                        navigate({ to: "/maker/shelves/$shelfId/edit", params: { shelfId: id } })
                      }
                    />
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
                    Page <span className="font-semibold text-foreground">{visibleCurrentPage}</span> of{" "}
                    <span className="font-semibold text-foreground">{totalPages}</span>
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, Math.min(p, totalPages) + 1))}
                    disabled={visibleCurrentPage === totalPages}
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
