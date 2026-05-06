import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useShelves } from "@/queries/maker";
import type { Shelf } from "@/types/maker";

interface ShelfSelectionFlowProps {
  onShelfSelect: (shelf: Shelf) => void;
  onShelfCreate?: (
    shelfData: Omit<Shelf, "id" | "status" | "assignedTo">,
  ) => void;
  /** When true, hides the internal heading (use when page header provides context) */
  compact?: boolean;
  /** When false, only allows selecting existing shelves (no create option). Requires onShelfCreate to be omitted. */
  allowCreate?: boolean;
}

export function ShelfSelectionFlow({
  onShelfSelect,
  onShelfCreate,
  compact = false,
  allowCreate = true,
}: ShelfSelectionFlowProps) {
  const [activeTab, setActiveTab] = useState<"select" | "create">("select");
  const [searchQuery, setSearchQuery] = useState("");
  const { data: shelves, isLoading } = useShelves();

  // Create Mode State
  const [formData, setFormData] = useState({
    aisleCode: "",
    bayCode: "",
    shelfName: "",
    description: "",
  });

  const filteredShelves = useMemo(() => {
    if (!shelves) return [];
    if (!searchQuery) return shelves;

    const lowerQuery = searchQuery.toLowerCase();
    return shelves.filter(
      (shelf) =>
        shelf.shelfName.toLowerCase().includes(lowerQuery) ||
        `aisle ${shelf.aisleCode ?? (shelf.aisleNumber != null ? `A${shelf.aisleNumber}` : "")}`
          .toLowerCase()
          .includes(lowerQuery) ||
        `bay ${shelf.bayCode ?? (shelf.bayNumber != null ? String(shelf.bayNumber) : "")}`
          .toLowerCase()
          .includes(lowerQuery) ||
        `${shelf.aisleCode ?? shelf.aisleNumber ?? ""}-${shelf.bayCode ?? shelf.bayNumber ?? ""}`.includes(
          lowerQuery,
        ),
    );
  }, [shelves, searchQuery]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onShelfCreate?.({
      aisleCode: formData.aisleCode,
      bayCode: formData.bayCode,
      shelfName: formData.shelfName,
      description: formData.description,
    });
  };

  const isFormValid =
    formData.aisleCode && formData.bayCode && formData.shelfName;

  return (
    <div className="space-y-6">
      {!compact && (
        <div className="space-y-2 text-center">
          <h2 className="text-foreground text-2xl font-bold">
            Which shelf are you auditing?
          </h2>
          <p className="text-muted-foreground">
            {allowCreate
              ? "Select an existing shelf or create a new one if it's not listed."
              : "Select a shelf to begin your audit."}
          </p>
        </div>
      )}

      {/* Tabs - only when allowCreate */}
      {allowCreate && (
        <div
          className={cn(
            "border-border bg-card flex max-w-sm rounded-lg border p-0.5",
            compact && "mx-auto",
          )}
          role="tablist"
          aria-label="Shelf selection mode"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "select"}
            onClick={() => setActiveTab("select")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium transition-all",
              "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
              activeTab === "select"
                ? "bg-accent text-accent-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground",
            )}
          >
            <Search className="size-4" />
            Select Existing
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "create"}
            onClick={() => setActiveTab("create")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium transition-all",
              "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
              activeTab === "create"
                ? "bg-accent text-accent-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground",
            )}
          >
            <Plus className="size-4" />
            Create New
          </button>
        </div>
      )}

      {activeTab === "select" || !allowCreate ? (
        <div className="animate-in fade-in slide-in-from-bottom-2 space-y-4 duration-300">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              placeholder="Search by aisle, bay or shelf name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-card/50 h-12 pl-10"
            />
          </div>

          <div className="scrollbar-thin max-h-[400px] space-y-2 overflow-y-auto pr-2">
            {isLoading ? (
              <div className="text-muted-foreground py-8 text-center">
                Loading shelves...
              </div>
            ) : filteredShelves.length > 0 ? (
              filteredShelves.map((shelf) => (
                <button
                  key={shelf.id}
                  onClick={() => onShelfSelect(shelf)}
                  className="border-border bg-card/50 hover:bg-accent hover:border-accent group flex w-full items-center justify-between rounded-xl border p-4 transition-all"
                >
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-accent text-xs font-bold tracking-wider uppercase">
                        Aisle{" "}
                        {shelf.aisleCode ??
                          (shelf.aisleNumber != null
                            ? `A${shelf.aisleNumber}`
                            : "—")}
                      </span>
                      <span className="bg-muted-foreground/30 size-1 rounded-full" />
                      <span className="text-accent text-xs font-bold tracking-wider uppercase">
                        Bay{" "}
                        {shelf.bayCode ??
                          (shelf.bayNumber != null ? shelf.bayNumber : "—")}
                      </span>
                    </div>
                    <h4 className="text-card-foreground mt-0.5 font-semibold">
                      {shelf.shelfName}
                    </h4>
                  </div>
                  <ArrowRight className="text-muted-foreground group-hover:text-accent size-5 transition-all group-hover:translate-x-1" />
                </button>
              ))
            ) : (
              <div className="space-y-3 py-12 text-center">
                <div className="bg-muted/50 text-muted-foreground mx-auto flex size-12 items-center justify-center rounded-full">
                  <Search className="size-6" />
                </div>
                <div>
                  <p className="text-foreground font-medium">
                    No shelves found
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {allowCreate
                      ? "Try searching for something else or create a new shelf."
                      : "Create shelves from the Shelves page to get started."}
                  </p>
                </div>
                {allowCreate ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab("create")}
                    className="mt-2"
                  >
                    Create New Shelf
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" asChild className="mt-2">
                    <Link to="/maker/audits/planogram">
                      Go to Planogram Audits
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      ) : allowCreate ? (
        <form
          onSubmit={handleCreateSubmit}
          className="animate-in fade-in slide-in-from-bottom-2 space-y-6 duration-300"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="aisleCode">Aisle Code</Label>
              <Input
                id="aisleCode"
                type="text"
                placeholder="e.g. A2"
                value={formData.aisleCode}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    aisleCode: e.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bayCode">Bay Code</Label>
              <Input
                id="bayCode"
                type="text"
                placeholder="e.g. 01"
                value={formData.bayCode}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, bayCode: e.target.value }))
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shelfName">Shelf Name</Label>
            <Input
              id="shelfName"
              placeholder="e.g. Beverages - Soft Drinks"
              value={formData.shelfName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, shelfName: e.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <textarea
              id="description"
              rows={3}
              placeholder="Brief description of products on this shelf..."
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
          </div>

          <Button
            type="submit"
            className="h-12 w-full text-base font-semibold"
            disabled={!isFormValid}
          >
            Create Shelf & Continue
            <Check className="ml-2 size-5" />
          </Button>
        </form>
      ) : null}
    </div>
  );
}
